import { oleoduc, writeData } from "oleoduc";
import fs from "fs";
import { upsert } from "#src/common/db/mongodb.js";
import { nafs } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { Readable } from "stream";
import { omitNil } from "#src/common/utils/objectUtils.js";
import config from "#src/config.js";

const logger = getLoggerWithContext("import");

export async function importNafs(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const nafsFilePath = options.nafsFile || config.data.files.nafs;
  const nafsJson = JSON.parse(await fs.promises.readFile(nafsFilePath));

  await oleoduc(
    Readable.from(nafsJson),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            nafs(),
            { code: data.code },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...data,
              }),
            }
          );

          if (res.upsertedCount) {
            logger.info(`Naf ${data.code} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Naf ${data.code} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Naf ${data.code} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le naf ${data.code}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
