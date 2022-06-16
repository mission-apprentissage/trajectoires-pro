import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { getCFD } from "../common/actions/getCFD.js";
import { certificationsStats, formationsStats } from "../common/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omit, pick } from "lodash-es";
import { flattenObject } from "../common/utils/objectUtils.js";

const logger = getLoggerWithContext("import");

const statsMapper = {
  certification: {
    getCollection: certificationsStats,
    getSelector: (stats) => pick(stats, ["millesime", "code_certification"]),
  },
  formation: {
    getCollection: formationsStats,
    getSelector: (stats) => pick(stats, ["uai", "millesime", "code_certification"]),
  },
};

function streamStats(type) {
  const statsType = statsMapper[type];

  return compose(
    statsType.getCollection().find().stream(),
    transformData((data) => {
      return {
        stats: data,
        ...statsType,
      };
    })
  );
}

export async function generateStats() {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  await oleoduc(
    mergeStreams(streamStats("certification"), streamStats("formation")),
    writeData(
      async ({ stats, getCollection, getSelector }) => {
        try {
          const collection = getCollection();
          const cfd = await getCFD(stats.code_certification);
          const alternatifs = cfd?.code_formation_alternatifs || [];

          if (alternatifs.length === 0) {
            return;
          }

          await Promise.all(
            alternatifs.map(async (codeFormation) => {
              const selector = { ...getSelector(stats), code_certification: codeFormation };

              const nbStats = await collection.countDocuments({ ...selector, "_meta.generated": false });
              if (nbStats > 0) {
                return;
              }

              const res = await collection.updateOne(
                selector,
                {
                  $set: {
                    ...flattenObject(omit(stats, ["_id"])),
                    code_certification: codeFormation,
                    "_meta.generated": true,
                  },
                },
                { upsert: true }
              );

              if (res.upsertedCount) {
                logger.info(`Nouvelle stats générée à partir de la stats ${stats._id}`, selector);
                jobStats.created++;
              } else if (res.modifiedCount) {
                jobStats.updated++;
                logger.warn(`Stats mise à jour à partir de la stats ${stats._id}`, selector);
              } else {
                logger.trace(`Stats déjà à jour à partir de la stats ${stats._id}`, selector);
              }
            })
          );
        } catch (e) {
          logger.error(e, `Impossible de générer une nouvelle stats à partir de la stats ${stats._id}`);
          jobStats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}
