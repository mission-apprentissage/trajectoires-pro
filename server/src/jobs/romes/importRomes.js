import { oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { rome } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { merge, pick } from "lodash-es";
import { streamRomes } from "#src/services/dataGouv/rome.js";
import { DataGouvApi } from "#src/services/dataGouv/DataGouvApi.js";

const logger = getLoggerWithContext("import");

export async function importRomes(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  // Set a default retry for DataGouv API
  const datagouvOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.datagouvOptions || {});
  const datagouv = options.datagouv || new DataGouvApi(datagouvOptions);

  await oleoduc(
    await streamRomes({ api: datagouv }),
    transformData(
      async (data) => {
        return pick(data, ["code_ogr", "code_rome", "libelle"]);
      },
      { parallel: 4 }
    ),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            rome(),
            { code_rome: data.code_rome },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: data,
            }
          );

          if (res.upsertedCount) {
            logger.info(`ROME ${data.code_rome} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`ROME ${data.code_rome} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`ROME ${data.code_rome} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le ROME ${data.code_rome}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
