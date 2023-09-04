import { compose, flattenArray, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { createReadStream } from "fs";
import { Readable } from "stream";
import { omit, pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import path from "path";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { isUAIValid } from "#src/common/utils/validationUtils.js";
import { InserJeunes } from "#src/services/inserjeunes/InserJeunes.js";
import { bcn, formationsStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { findRegionByNom } from "#src/services/regions.js";
import { computeCustomStats, getMillesimesFormations, INSERJEUNES_IGNORED_STATS_NAMES } from "#src/common/stats.js";
import { getDirname } from "#src/common/utils/esmUtils.js";

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

async function streamDefaultParameters() {
  const streams = await Promise.all(
    getMillesimesFormations().map((millesime) => convertEtablissementsIntoParameters(millesime))
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
          const stats = omit(formationStats, INSERJEUNES_IGNORED_STATS_NAMES);
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
              ...stats,
              ...customStats,
              region: pick(params.region, ["code", "nom"]),
              code_formation_diplome: certification?.code_formation_diplome,
              diplome: certification?.diplome,
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
