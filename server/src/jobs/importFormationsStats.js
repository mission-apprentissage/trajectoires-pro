import { compose, flattenArray, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { Readable } from "stream";
import { getFromStorage } from "../common/utils/ovhUtils.js";
import { parseCsv } from "../common/utils/csvUtils.js";
import { isUAIValid } from "../common/utils/validationUtils.js";
import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { bcn, formationsStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { findRegionByNom } from "../common/regions.js";
import { omit, pick } from "lodash-es";
import { computeCustomStats, getMillesimes, INSERJEUNES_IGNORED_STATS_NAMES } from "../common/stats.js";

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
  const streams = await Promise.all(getMillesimes().map((millesime) => convertEtablissementsIntoParameters(millesime)));

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

export async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = options.inserjeunes || new InserJeunes();

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
          const stats = omit(formationStats, INSERJEUNES_IGNORED_STATS_NAMES);
          const customStats = computeCustomStats(formationStats);

          const res = await formationsStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...stats,
                ...customStats,
                region: pick(params.region, ["code", "nom"]),
                code_formation_diplome: certification?.code_formation_diplome,
                diplome: certification?.diplome,
                "_meta.inserjeunes": pick(formationStats, INSERJEUNES_IGNORED_STATS_NAMES),
              }),
            },
            { upsert: true }
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
