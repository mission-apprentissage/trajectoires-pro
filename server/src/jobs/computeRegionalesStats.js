import { oleoduc, writeData } from "oleoduc";
import { formationsStats, regionalesStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { $computeCustomStats, $sumValeursStats } from "../common/utils/mongodbUtils.js";
import { ALL, reduceStats } from "../common/stats.js";
import { omit } from "lodash-es";

const logger = getLoggerWithContext("import");

async function getMissingStats() {
  const res = await formationsStats()
    .aggregate([
      {
        $group: {
          _id: "$millesime",
          ...reduceStats(ALL, (statName) => {
            return { [statName]: { $push: "$" + statName } };
          }),
        },
      },
    ])
    .toArray();

  return res.map(({ _id, ...stats }) => {
    return { millesime: _id, stats: Object.keys(stats).filter((key) => stats[key].length === 0) };
  });
}

export async function computeRegionalesStats() {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const missingStats = await getMissingStats();

  logger.info(`Import des stats régionales...`);
  await oleoduc(
    formationsStats()
      .aggregate([
        {
          $group: {
            _id: {
              region: "$region.code",
              filiere: "$filiere",
              millesime: "$millesime",
              code_certification: "$code_certification",
            },
            region: { $first: "$region" },
            filiere: { $first: "$filiere" },
            millesime: { $first: "$millesime" },
            code_certification: { $first: "$code_certification" },
            code_formation_diplome: { $first: "$code_formation_diplome" },
            diplome: { $first: "$diplome" },
            ...$sumValeursStats(),
          },
        },
        {
          $addFields: {
            ...$computeCustomStats(),
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ])
      .stream(),
    writeData(
      async (stats) => {
        const query = {
          "region.code": stats.region.code,
          filiere: stats.filiere,
          millesime: stats.millesime,
          code_certification: stats.code_certification,
        };
        const missing = missingStats.find((as) => as.millesime === stats.millesime);

        try {
          const res = await regionalesStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...omit(stats, missing?.stats),
              }),
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info("Nouvelle stats de région ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats de région mise à jour", query);
          } else {
            logger.trace("Stats de région déjà à jour", query);
          }
        } catch (e) {
          logger.error({ err: e, query }, `Impossible d'importer la stats`);
          jobStats.failed++;
          return null; //ignore chunk
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}
