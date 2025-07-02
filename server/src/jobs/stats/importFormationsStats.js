import { compose, flattenArray, mergeStreams, oleoduc, transformData, writeData, filterData } from "oleoduc";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import path from "path";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { isUAIValid } from "#src/common/utils/validationUtils.js";
import { InserJeunes } from "#src/services/inserjeunes/InserJeunes.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { findRegionByNom, findAcademieByCode } from "#src/services/regions.js";
import {
  computeCustomStats,
  getMillesimesFormations,
  INSERJEUNES_STATS_NAMES,
  INSERJEUNES_IGNORED_STATS_NAMES,
  getUnknownIJFields,
} from "#src/common/stats.js";
import { getCertificationInfo } from "#src/common/certification.js";
import { getDirname } from "#src/common/utils/esmUtils.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";

const __dirname = getDirname(import.meta.url);
const logger = getLoggerWithContext("import");

async function convertEtablissementsIntoParameters(millesime) {
  const files = [
    `depp-2022-etablissements-${millesime}-pro.csv`,
    `depp-2022-etablissements-${millesime}-apprentissage.csv`,
  ];

  const streams = await Promise.all(
    files.map(async (fileName) => {
      const stream = createReadStream(path.join(__dirname, "../../../data/", fileName));
      return compose(stream, parseCsv());
    })
  );

  return compose(
    mergeStreams(streams),
    transformData((data) => {
      return {
        uai: data["n°UAI de l'établissement"],
        region: data["Région"],
        millesime,
      };
    })
  );
}

async function streamDefaultParameters(millesimes) {
  const streams = await Promise.all(millesimes.map((millesime) => convertEtablissementsIntoParameters(millesime)));

  return mergeStreams(streams);
}

async function loadParameters(parameters, millesimes) {
  const results = [];

  logger.info(`Création de la liste des établissements à importer par millésime`);

  const stream = parameters ? Readable.from(parameters) : await streamDefaultParameters(millesimes);

  const logCurrentList = (millesimes, results) =>
    logger.debug(`Etablissements à importer pour les millésimes ${millesimes.join(",")} : ${results.length}`);

  await oleoduc(
    stream,
    writeData(
      async (data) => {
        const { uai, millesime } = data;

        if (!isUAIValid(uai)) {
          logger.warn(`UAI invalide détecté ${uai}`);
          return;
        }

        const etablissement = await AcceEtablissementRepository.first({ numero_uai: uai });

        const index = results.findIndex((e) => e.uai === uai && e.millesime === millesime);
        if (index === -1) {
          results.push({
            uai,
            libelle_etablissement: etablissement?.appellation_officielle,
            millesime,
            region: findRegionByNom(data.region),
            academie: findAcademieByCode(etablissement?.academie),
          });

          if (results.length % 100 === 0) {
            logCurrentList(millesimes, results);
          }
        }
      },
      { parallel: 10 }
    )
  );

  logCurrentList(millesimes, results);

  return results;
}

export async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  // Set a default retry for the InserJeunes API
  const inserjeunesOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.inserjeunesOptions || {});
  const ij = options.inserjeunes || new InserJeunes(inserjeunesOptions);
  const millesimes = options.millesimes || getMillesimesFormations();

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  const parameters = await loadParameters(options.parameters, millesimes);

  logger.info(`Import des stats pour ${parameters.length} UAI/millesime...`);

  await oleoduc(
    Readable.from(parameters),
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
          .catch((e) => handleError(e, params));
      },
      { parallel: 10 }
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
          const customStats = computeCustomStats(formationStats);

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
