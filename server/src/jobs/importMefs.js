import { asDiplome, getBCNTable } from "../common/bcn.js";
import { oleoduc, writeData } from "oleoduc";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { mefs } from "../common/db/collections/collections.js";
import { parseAsUTCDate } from "../common/utils/dateUtils.js";

const logger = getLoggerWithContext("import");

export async function importMefs(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const source = await getBCNTable("N_MEF", options);

  await oleoduc(
    source,
    writeData(
      async (data) => {
        const mef = data["MEF"];
        const codeFormationDiplome = data["FORMATION_DIPLOME"];
        const dateFermeture = data["DATE_FERMETURE"];
        stats.total++;

        try {
          const diplome = asDiplome(codeFormationDiplome);
          if (!diplome) {
            logger.warn(`Diplome inconnu pour le mef ${mef}`);
          }

          const res = await mefs().updateOne(
            {
              mef,
            },
            {
              $setOnInsert: omitNil({
                "_meta.date_import": new Date(),
                mef,
                mef_stat_9: data["MEF_STAT_9"],
                mef_stat_11: data["MEF_STAT_11"],
                libelle: data["LIBELLE_LONG"],
                diplome,
                code_formation_diplome: codeFormationDiplome,
              }),
              $set: omitNil({
                date_fermeture: dateFermeture ? parseAsUTCDate(dateFermeture) : null,
              }),
            },
            { upsert: true, setDefaultsOnInsert: true, runValidators: true }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau MEF ${mef} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.info(`MEF ${mef} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`MEF ${mef} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le code mef ${mef}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
