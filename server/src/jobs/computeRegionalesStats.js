import { oleoduc, writeData } from "oleoduc";
import { upsert } from "../common/db/mongodb.js";
import { formationsStats, regionalesStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { ALL, computeCustomStats, getStats, VALEURS } from "../common/stats.js";
import { omit } from "lodash-es";
import { $field, $sumOf } from "../common/utils/mongodbUtils.js";

const logger = getLoggerWithContext("import");

async function getMissingStats(filters) {
  const res = await formationsStats()
    .aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          ...getStats(ALL, (statName) => ({ $push: $field(statName) })),
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .toArray();

  const stats = res[0];
  return Object.keys(stats).filter((key) => stats[key].length === 0);
}

function aggregateFormationStats() {
  return formationsStats()
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
          ...getStats(VALEURS, (statName) => $sumOf($field(statName))),
        },
      },
      {
        $addFields: {
          ...computeCustomStats("aggregate"),
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ])
    .stream();
}

export async function computeRegionalesStats() {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  logger.info(`Calcul des stats régionales...`);
  await oleoduc(
    aggregateFormationStats(),
    writeData(
      async (stats) => {
        const query = {
          "region.code": stats.region.code,
          filiere: stats.filiere,
          millesime: stats.millesime,
          code_certification: stats.code_certification,
        };
        const missingStats = await getMissingStats(query);

        try {
          const res = await upsert(regionalesStats(), query, {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil({
              ...omit(stats, missingStats),
            }),
          });

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
