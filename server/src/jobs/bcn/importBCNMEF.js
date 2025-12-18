import { oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { bcnMef } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils.js";
import { fromPairs } from "lodash-es";
import { BCNApi } from "#src/services/bcn/BCNApi.js";

const logger = getLoggerWithContext("import");

function fieldsValue(data) {
  const MEF_FIELDS_MAPPER = {
    mef: "mef",
    dispositif_formation: "dispositif_formation",
    formation_diplome: "formation_diplome",
    duree_dispositif: "duree_dispositif",
    annee_dispositif: "annee_dispositif",
    libelle_court: "libelle_court",
    libelle_long: "libelle_long",
    date_ouverture: "date_ouverture",
    date_fermeture: "date_fermeture",
    statut_mef: "statut_mef",
    nb_option_obligatoire: "nb_option_obligatoire",
    nb_option_facultatif: "nb_option_facultatif",
    renforcement_langue: "renforcement_langue",
    duree_projet: "duree_projet",
    duree_stage: "duree_stage",
    horaire: "horaire",
    mef_inscription_scolarite: "mef_inscription_scolarite",
    mef_stat_11: "mef_stat_11",
    mef_stat_9: "mef_stat_9",
    date_intervention: "date_intervention",
    libelle_edition: "libelle_edition",
    n_commentaire: "commentaire",
  };

  return fromPairs(
    Object.keys(MEF_FIELDS_MAPPER).map((k) => {
      const value = ["date_ouverture", "date_fermeture", "date_intervention"].includes(k)
        ? parseAsUTCDate(data[k])
        : data[k] !== null
          ? `${data[k]}`
          : null;
      return [MEF_FIELDS_MAPPER[k], value];
    })
  );
}

export async function importBCNMEF() {
  logger.info(`Importation des formations de la voie scolaire depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const bcnApi = new BCNApi();

  await oleoduc(
    await bcnApi.fetchNomenclature("N_MEF"),
    transformData(async (data) => fieldsValue(data)),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            bcnMef(),
            { mef_stat_11: data.mef_stat_11 },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil(data),
            }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau code ${data.mef_stat_11} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Code ${data.mef_stat_11} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Code ${data.mef_stat_11} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le code ${data.mef_stat_11}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
