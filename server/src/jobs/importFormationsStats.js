import { compose, flattenArray, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { Readable } from "stream";
import { omit, pick, merge } from "lodash-es";
import { getFromStorage } from "../common/utils/ovhUtils.js";
import { parseCsv } from "../common/utils/csvUtils.js";
import { isUAIValid } from "../common/utils/validationUtils.js";
import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { upsert } from "../common/db/mongodb.js";
import { bcn, formationsStats, acceEtablissements } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { findRegionByNom, findDepartementByCode } from "../common/regions.js";
import { computeCustomStats, getFormationMillesimes, INSERJEUNES_IGNORED_STATS_NAMES } from "../common/stats.js";

const logger = getLoggerWithContext("import");

async function convertEtablissementsIntoParameters(millesime) {
  const files = [
    `depp-2022-etablissements-${millesime}-pro.csv`,
    `depp-2022-etablissements-${millesime}-apprentissage.csv`,
  ];

  const streams = await Promise.all(
    files.map(async (fileName) => {
      const stream = await getFromStorage(fileName);
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

async function streamDefaultParameters() {
  const streams = await Promise.all(
    getFormationMillesimes().map((millesime) => convertEtablissementsIntoParameters(millesime))
  );

  return mergeStreams(streams);
}

async function loadParameters(parameters) {
  const results = [];
  const stream = parameters ? Readable.from(parameters) : await streamDefaultParameters();

  await oleoduc(
    stream,
    writeData((data) => {
      const { uai, millesime } = data;

      if (!isUAIValid(uai)) {
        logger.warn(`UAI invalide détecté ${uai}`);
        return;
      }

      const index = results.findIndex((e) => e.uai === uai && e.millesime === millesime);
      if (index === -1) {
        results.push({ uai, millesime, region: findRegionByNom(data.region) });
      }
    })
  );

  return results;
}

async function buildLocalisation(uai) {
  const etablissements = await acceEtablissements().findOne({
    numero_uai: uai,
  });

  if (!etablissements) {
    logger.error({ uai: uai }, `Etablissement inconnu dans la liste ACCE`);
    return null;
  }

  const codeDepartement =
    etablissements.departement_insee_3[0] == "0"
      ? etablissements.departement_insee_3.substr(1)
      : etablissements.departement_insee_3;
  const departement = findDepartementByCode(codeDepartement);
  if (!departement) {
    logger.error({ uai: uai }, `Département (${codeDepartement}) inconnu`);
    return null;
  }

  return {
    departement,
    code_postal: etablissements.code_postal_uai,
    code_commune: etablissements.commune,
    nom_commune: etablissements.commune_libe,
  };
}

export async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  // Set a default retry for the InserJeunes API
  const inserjeunesOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.inserjeunesOptions || {});
  const ij = options.inserjeunes || new InserJeunes(inserjeunesOptions);

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  const parameters = await loadParameters(options.parameters);

  logger.info(`Import des stats pour ${parameters.length} UAI/millesime...`);

  await oleoduc(
    Readable.from(parameters),
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
    writeData(
      async ({ params, stats: formationStats }) => {
        const query = {
          uai: formationStats.uai,
          code_certification: formationStats.code_certification,
          millesime: formationStats.millesime,
        };

        try {
          const certification = await bcn().findOne({ code_certification: formationStats.code_certification });
          const stats = omit(omit(formationStats, INSERJEUNES_IGNORED_STATS_NAMES), "metadata");
          const customStats = computeCustomStats(formationStats);
          const res = await upsert(
            formationsStats(),
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...stats,
                ...customStats,
                region: pick(params.region, ["code", "nom"]),
                localisation: await buildLocalisation(formationStats.uai),
                code_formation_diplome: certification?.code_formation_diplome,
                diplome: certification?.diplome,
                "_meta.inserjeunes": {
                  ...pick(formationStats, INSERJEUNES_IGNORED_STATS_NAMES),
                  UAI: omitNil(formationStats.metadata.UAI),
                },
              }),
            },
            {
              $set: {
                "_meta.updated_on": new Date(),
              },
            }
          );

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
