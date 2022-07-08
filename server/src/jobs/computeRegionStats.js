import { oleoduc, writeData } from "oleoduc";
import { formationsStats, regionStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { $tauxStats, $valeursStats } from "../common/utils/mongodbUtils.js";

const logger = getLoggerWithContext("import");

export async function computeRegionStats() {
  const jobStats = { created: 0, updated: 0, failed: 0 };

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
            ...$valeursStats(),
          },
        },
        {
          $addFields: {
            ...$tauxStats(),
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

        try {
          const res = await regionStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...stats,
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
