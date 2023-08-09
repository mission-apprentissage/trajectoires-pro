import { oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "../common/db/mongodb.js";
import { getBCNTable } from "../common/bcn.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { bcnMef } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { parseAsUTCDate } from "../common/utils/dateUtils.js";
import { fromPairs } from "lodash-es";

const logger = getLoggerWithContext("import");

function fieldsValue(data) {
  const MEF_FIELDS_MAPPER = {
    MEF: "mef",
    DISPOSITIF_FORMATION: "dispositif_formation",
    FORMATION_DIPLOME: "formation_diplome",
    DUREE_DISPOSITIF: "duree_dispositif",
    ANNEE_DISPOSITIF: "annee_dispositif",
    LIBELLE_COURT: "libelle_court",
    LIBELLE_LONG: "libelle_long",
    DATE_OUVERTURE: "date_ouverture",
    DATE_FERMETURE: "date_fermeture",
    STATUT_MEF: "statut_mef",
    NB_OPTION_OBLIGATOIRE: "nb_option_obligatoire",
    NB_OPTION_FACULTATIF: "nb_option_facultatif",
    RENFORCEMENT_LANGUE: "renforcement_langue",
    DUREE_PROJET: "duree_projet",
    DUREE_STAGE: "duree_stage",
    HORAIRE: "horaire",
    MEF_INSCRIPTION_SCOLARITE: "mef_inscription_scolarite",
    MEF_STAT_11: "mef_stat_11",
    MEF_STAT_9: "mef_stat_9",
    DATE_INTERVENTION: "date_intervention",
    LIBELLE_EDITION: "libelle_edition",
    N_COMMENTAIRE: "commentaire",
  };

  return fromPairs(
    Object.keys(MEF_FIELDS_MAPPER).map((k) => {
      const value = ["DATE_OUVERTURE", "DATE_FERMETURE", "DATE_INTERVENTION"].includes(k)
        ? parseAsUTCDate(data[k])
        : data[k];
      return [MEF_FIELDS_MAPPER[k], value];
    })
  );
}

export async function importBCNMEF(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await getBCNTable("N_MEF", options),
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
