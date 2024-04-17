import { oleoduc, writeData, flattenArray, transformData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { onisepRaw } from "#src/common/db/collections/collections.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { CatalogueApprentissageApi } from "#src/services/catalogueApprentissage/CatalogueApprentissageApi.js";
import { merge, range, pick, mapValues } from "lodash-es";
import { Readable } from "stream";
import { OnisepApi } from "#src/services/onisep/OnisepApi.js";
import config from "#src/config.js";

const logger = getLoggerWithContext("import");

export async function importOnisep(type, keys = [], options = {}) {
  const dataset = config.onisep.datasets[type];
  if (!dataset) {
    logger.error(`Le dataset pour le type ${type} n'existe pas`);
    return stats;
  }

  logger.info(`Importation du dataset Onisep ${dataset}`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const limitPerPage = options.limitPerPage || 1000;
  const onisepApiOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.onisepApiOptions || {});
  const onisepApi = options.onisepApi || new OnisepApi(onisepApiOptions);

  function handleError(e, context, msg = `Impossible d'importer la donnée`) {
    logger.error({ err: e, ...context }, msg);
    stats.failed++;
    return null; //ignore chunk
  }

  await oleoduc(
    Readable.from([
      await onisepApi
        .search(dataset, "", { from: 0, size: 1 })
        .catch((e) => handleError(e, {}, "Impossible de récupérer le nombre de page du dataset")),
    ]),
    transformData((result) => {
      const nbPages = Math.ceil(result.total / limitPerPage);
      const pages = range(0, nbPages);
      return pages;
    }),
    flattenArray(),
    transformData(async (page) => {
      try {
        const result = await onisepApi.search(dataset, "", { from: page * limitPerPage, size: limitPerPage });
        return result.results;
      } catch (err) {
        return handleError(err, { page });
      }
    }),
    flattenArray(),
    writeData(
      async (data) => {
        stats.total++;

        const key = keys.map((k) => data[k]).join("-");
        const millesime = new Date().getFullYear().toString();

        try {
          const res = await upsert(
            onisepRaw(),
            {
              dataset,
              type,
              key,
              millesime,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: {
                millesime,
                data,
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Nouvelle donnée ${type}/${key} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Donnée ${type}/${key} mise à jour`);
            stats.updated++;
          } else {
            logger.trace(`Donnée ${type}/${key} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la donnée ${type}/${key}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
