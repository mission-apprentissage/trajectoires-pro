import { oleoduc, writeData, mergeStreams } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { upsert } from "#src/common/db/mongodb.js";
import { onisepEtablissements } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { OnisepApi } from "#src/services/onisep/OnisepApi.js";
import config from "#src/config.js";

const logger = getLoggerWithContext("import");

export async function importOnisepEtablissement() {
  logger.info(`Importation des établissements des données de l'Onisep`);
  const stats = { total: 0, updated: 0, failed: 0 };
  const onisepApi = new OnisepApi();

  await oleoduc(
    mergeStreams(
      await onisepApi.datasets(config.onisep.datasets.etablissementSecondaire),
      await onisepApi.datasets(config.onisep.datasets.etablissementSuperieur)
    ),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            onisepEtablissements(),
            {
              code_uai: data.code_uai,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil(data),
            }
          );

          if (res.modifiedCount) {
            logger.debug(`Etablissement ${data.code_uai} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Etablissement pour ${data.code_uai} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de l'établissement ${data.code_uai}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
