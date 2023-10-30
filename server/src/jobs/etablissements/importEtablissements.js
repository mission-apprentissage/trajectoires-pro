import { oleoduc, writeData } from "oleoduc";
import moment from "moment-timezone";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { acceEtablissements } from "#src/common/db/collections/collections.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import * as ACCE from "#src/services/acce.js";

const logger = getLoggerWithContext("import");

export async function importEtablissements(options = {}) {
  logger.info(`Importation des établissements depuis le fichier établissement de l'ACCE`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const etablissementsFilePath = options.acceFile || null;

  const formatDate = (dateStr) => (dateStr ? moment.tz(dateStr, "DD/MM/YYYY", "Europe/Paris").toDate() : null);

  await oleoduc(
    ACCE.etablissements(etablissementsFilePath),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            acceEtablissements(),
            {
              numero_uai: data.numero_uai,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...data,
                date_ouverture: formatDate(data.date_ouverture),
                date_fermeture: formatDate(data.date_fermeture),
                date_derniere_mise_a_jour: formatDate(data.date_derniere_mise_a_jour),
                date_geolocalisation: formatDate(data.date_geolocalisation),
              }),
            }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau établissement ${data.numero_uai} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Etablissement ${data.numero_uai} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Etablissement ${data.numero_uai} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
