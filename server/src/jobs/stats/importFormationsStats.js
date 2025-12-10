import { flattenArray, oleoduc, transformData, writeData, filterData, compose } from "oleoduc";
import { Readable } from "stream";
import { pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { isUAIValid } from "#src/common/utils/validationUtils.js";
import { InserJeunes } from "#src/services/inserjeunes/InserJeunes.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { findRegionByCodeInsee, findAcademieByCode } from "#src/services/regions.js";
import { NATURE_UAI_ETABLISSEMENTS_INSERJEUNES } from "#src/services/acce.js";
import {
  computeCustomStats,
  getMillesimesFormations,
  INSERJEUNES_STATS_NAMES,
  INSERJEUNES_IGNORED_STATS_NAMES,
  INSERJEUNES_CUSTOM_STATS_NAMES,
  getUnknownIJFields,
} from "#src/common/stats.js";
import { getCertificationInfo } from "#src/common/certification.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";

const logger = getLoggerWithContext("import");

export async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0, ignored: 0 };

  // Set a default retry for the InserJeunes API
  const inserjeunesOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.inserjeunesOptions || {});
  const ij = options.inserjeunes || new InserJeunes(inserjeunesOptions);
  const millesimes = options.millesimes || getMillesimesFormations();
  const parameters = options.parameters || null;

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  logger.info(`Import des stats...`, { parameters, millesimes });
  await oleoduc(
    parameters
      ? compose(
          Readable.from(parameters.map((d) => d.uai)),
          transformData(async (uai) => {
            const etablissement = await AcceEtablissementRepository.first({ numero_uai: uai });
            if (!etablissement) {
              handleError(new Error(`Etablissement inconnue dans la base ACCE`, parameters.uai));
              return null;
            }

            return etablissement;
          })
        )
      : await AcceEtablissementRepository.find({ nature_uai: NATURE_UAI_ETABLISSEMENTS_INSERJEUNES }),
    transformData((data) => {
      return millesimes.map((millesime) => ({
        millesime,
        etablissement: data,
      }));
    }),
    flattenArray(),
    transformData(
      async (data) => {
        const { etablissement, millesime } = data;

        if (!isUAIValid(etablissement.numero_uai)) {
          logger.warn(`UAI invalide détecté ${etablissement.numero_uai}`);
          return;
        }

        return {
          uai: etablissement.numero_uai,
          libelle_etablissement: etablissement.appellation_officielle,
          millesime,
          region: findRegionByCodeInsee(etablissement.departement_insee_3),
          academie: findAcademieByCode(etablissement.academie),
        };
      },
      { parallel: 10 }
    ),
    filterData((parameters) => {
      if (!parameters.academie) {
        handleError(new Error(`Académie inconnue pour l'établissement ${parameters.uai}`));
        return false;
      }
      return true;
    }),
    transformData(
      (params) => {
        return ij
          .getFormationsStats(params.uai, params.millesime)
          .then((array) => {
            return array.map((stats) => {
              return {
                stats,
                params,
              };
            });
          })
          .catch((e) => {
            if (e.httpStatusCode === 400 && e.data === '{"msg":"UAI incorrect ou agricole"}') {
              logger.info("Pas de statistiques pour cet établissement.", {
                uai: params.uai,
                millesime: params.millesime,
              });
              jobStats.ignored++;
              return;
            }
            return handleError(e, params);
          });
      },
      { parallel: 1 }
    ),
    flattenArray(),
    transformData((data) => {
      const unknownFields = getUnknownIJFields(data.stats, [
        "uai",
        "code_certification",
        "millesime",
        "filiere",
        ...INSERJEUNES_STATS_NAMES,
        ...INSERJEUNES_IGNORED_STATS_NAMES,
      ]);
      if (unknownFields) {
        logger.error(`Champs ${unknownFields.join(", ")} inconnus dans l'API InserJeunes`);
      }

      return data;
    }),
    writeData(
      async ({ params, stats: formationStats }) => {
        const query = {
          uai: formationStats.uai,
          code_certification: formationStats.code_certification,
          millesime: formationStats.millesime,
          filiere: { $ne: "superieur" },
        };

        try {
          const certification = await getCertificationInfo(formationStats.code_certification);
          const stats = pick(formationStats, INSERJEUNES_STATS_NAMES);
          const customStats = computeCustomStats(formationStats, "inserjeunes", INSERJEUNES_CUSTOM_STATS_NAMES);

          // Delete data compute with continuum job (= when type is not self)
          await formationsStats().deleteOne({
            ...query,
            "donnee_source.type": { $ne: "self" },
          });

          const res = await upsert(formationsStats(), query, {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil({
              ...pick(formationStats, ["code_certification", "uai", "millesime", "filiere"]),
              ...stats,
              ...customStats,
              ...certification,
              libelle_etablissement: params.libelle_etablissement,
              region: pick(params.region, ["code", "nom"]),
              academie: pick(params.academie, ["code", "nom"]),
              donnee_source: {
                code_certification: formationStats.code_certification,
                type: "self",
              },
              "_meta.inserjeunes": pick(formationStats, INSERJEUNES_IGNORED_STATS_NAMES),
            }),
          });

          if (res.upsertedCount) {
            logger.info("Nouvelle stats de formation ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats de formation mise à jour", query);
          } else {
            logger.trace("Stats de formation déjà à jour", query);
          }
        } catch (e) {
          handleError(e, query);
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}
