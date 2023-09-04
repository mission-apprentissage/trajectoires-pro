import { oleoduc, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { cfdMetiers } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { getCfdMetiers } from "#src/queries/getCfdMetiers.js";

const logger = getLoggerWithContext("import");

export async function importCfdMetiers() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await getCfdMetiers(),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            cfdMetiers(),
            { code_formation_diplome: data.code_formation_diplome },
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
            logger.info(`Métiers pour ${data.code_formation_diplome} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Métiers pour ${data.code_formation_diplome} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Métiers pour ${data.code_formation_diplome} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer les métiers pour le code ${data.code_formation_diplome}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
