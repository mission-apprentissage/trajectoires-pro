import { oleoduc, flattenArray, transformData, writeData, transformIntoStream, accumulateData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { romeMetier } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { merge } from "lodash-es";
import RomeRepository from "#src/common/repositories/rome.js";
import { DiagorienteApi } from "#src/services/diagoriente/DiagorienteApi.js";
import { Readable } from "stream";

const logger = getLoggerWithContext("import");

export async function importRomeMetiers(options = {}) {
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
    await RomeRepository.findAll(),
    accumulateData(
      (acc, data) => {
        // Take only the first letter of the ROME
        acc[data.code_rome.substr(0, 1)] = true;
        return acc;
      },
      { accumulator: {} }
    ),
    transformIntoStream((data) => Readable.from(Object.keys(data))),
    transformData(
      async (data) => {
        return diagoriente
          .fetchMetiersAvenir([data])
          .catch((e) => handleError(e, { code_formation_diplome: data.code_formation_diplome }));
      },
      { parallel: 4 }
    ),
    flattenArray(),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            romeMetier(),
            { code_rome: data.codeROME, title: data.title },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: {
                code_rome: data.codeROME,
                title: data.title,
                isMetierAvenir: true,
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Métier d'avenir ${data.title} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Métier d'avenir ${data.title} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Métier d'avenir ${data.title} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le métier d'avenir ${data.title}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
