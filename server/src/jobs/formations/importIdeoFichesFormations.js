import { oleoduc, writeData, filterData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { streamIdeoFichesFormations } from "#src/services/dataGouv/onisep.js";
import { formation as formationCollection } from "#src/common/db/collections/collections.js";

const logger = getLoggerWithContext("import");

export async function importIdeoFichesFormations() {
  logger.info(`Importation des données des fiches de formations Idéo`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const cleanDescription = (text) => {
    return text.replaceAll(/<p>[\s]+<\/p>/g, "");
  };
  await oleoduc(
    await streamIdeoFichesFormations(),
    filterData((data) => data.code_scolarite && data.descriptif_format_court),
    writeData(
      async (formation) => {
        try {
          const res = await formationCollection().updateMany(
            { cfd: formation.code_scolarite },
            {
              $set: {
                description: cleanDescription(formation.descriptif_format_court),
                onisep: {
                  identifiant: formation.identifiant,
                },
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Informations de formation ${formation.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Informations de formation ${formation.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Informations de formation ${formation.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les informations de formation ${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
