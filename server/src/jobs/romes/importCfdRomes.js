import { oleoduc, transformData, writeData, filterData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { cfdRomes } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { merge } from "lodash-es";
import BCNRepository from "#src/common/repositories/bcn.js";
import { DiagorienteApi } from "#src/services/diagoriente/DiagorienteApi.js";

const logger = getLoggerWithContext("import");

export async function importCfdRomes(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  // Set a default retry for Diagoriente API
  const diagorienteOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.diagorienteOptions || {});
  const diagoriente = options.diagoriente || new DiagorienteApi(diagorienteOptions);

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les romes`);
    stats.failed++;
    return null; //ignore chunk
  }

  await oleoduc(
    await BCNRepository.findAll(),
    filterData((bcn) => bcn.type === "cfd"),
    transformData(
      async (data) => {
        return diagoriente
          .fetchRomes([data.code_formation_diplome])
          .then((romes) => {
            return {
              code_formation_diplome: data.code_formation_diplome,
              code_romes: romes.map(({ codeROME }) => codeROME),
            };
          })
          .catch((e) => handleError(e, { code_formation_diplome: data.code_formation_diplome }));
      },
      { parallel: 4 }
    ),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            cfdRomes(),
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
            logger.info(`ROMEs pour ${data.code_formation_diplome} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`ROMEs pour ${data.code_formation_diplome} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`ROMEs pour ${data.code_formation_diplome} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer les ROMEs pour le code ${data.code_formation_diplome}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
