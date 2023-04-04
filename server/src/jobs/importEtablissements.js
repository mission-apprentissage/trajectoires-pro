import { oleoduc, writeData, filterData } from "oleoduc";
import { pick, omit } from "lodash-es";

import moment from "moment-timezone";
import path from "path";
import { upsert } from "../common/db/mongodb.js";
import { fields as caEtablissementsFields } from "../common/db/collections/caEtablissements.js";
import { fields as acceEtablissementsFields } from "../common/db/collections/acceEtablissements.js";
import { caEtablissements, acceEtablissements } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";

import { fetchEtablissements as caFetchEtablissements } from "../common/catalogueApprentissage/etablissements.js";
import { fetchEtablissements as acceFetchEtablissements } from "../common/acce/etablissements.js";

import { getDirname } from "../common/utils/esmUtils.js";

const __dirname = getDirname(import.meta.url);

const logger = getLoggerWithContext("import");

export async function importCAEtablissements() {
  const jobStats = {
    created: 0,
    updated: 0,
    failed: 0,
  };

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer l'établissement`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  logger.info(`Import des établissements du catalogue d'apprentissage...`);

  await oleoduc(
    await caFetchEtablissements(),
    filterData((etablissements) => etablissements.uai),
    writeData(
      async (etablissements) => {
        const { uai } = etablissements;
        const query = { uai };
        try {
          const res = await upsert(
            caEtablissements(),
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...pick(omit(etablissements, ["_id"]), [...Object.keys(caEtablissementsFields)]),
                date_creation: etablissements.date_creation ? new Date(etablissements.date_creation) : null,
                date_mise_a_jour: etablissements.date_mise_a_jour ? new Date(etablissements.date_mise_a_jour) : null,
                date_fermeture: etablissements.date_fermeture ? new Date(etablissements.date_fermeture) : null,
              }),
            },
            {
              $set: {
                "_meta.updated_on": new Date(),
              },
            }
          );
          if (res.upsertedCount) {
            logger.info("Nouvel établissement ajouté", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Etablissement mis à jour", query);
          } else {
            logger.trace("Etablissement déjà à jour", query);
          }
        } catch (e) {
          handleError(e, query);
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}

export async function importACCEEtablissements(options = {}) {
  const jobStats = {
    created: 0,
    updated: 0,
    failed: 0,
  };

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer l'établissement`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  const file = options.file;

  logger.info(`Import des établissements du fichier de l'ACCE...`);

  await oleoduc(
    await acceFetchEtablissements(file),
    writeData(
      async (etablissements) => {
        const { numero_uai } = etablissements;
        const query = { numero_uai };
        try {
          const res = await upsert(
            acceEtablissements(),
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...pick(etablissements, [...Object.keys(acceEtablissementsFields)]),
                date_ouverture: etablissements.date_ouverture
                  ? moment.tz(etablissements.date_ouverture, "DD/MM/YYYY", "Europe/Paris").toDate()
                  : null,
                date_fermeture: etablissements.date_fermeture
                  ? moment.tz(etablissements.date_ouverture, "DD/MM/YYYY", "Europe/Paris").toDate()
                  : null,
                date_derniere_mise_a_jour: etablissements.date_derniere_mise_a_jour
                  ? moment.tz(etablissements.date_ouverture, "DD/MM/YYYY", "Europe/Paris").toDate()
                  : null,
                date_geolocalisation: etablissements.date_geolocalisation
                  ? moment.tz(etablissements.date_ouverture, "DD/MM/YYYY", "Europe/Paris").toDate()
                  : null,
              }),
            },
            {
              $set: {
                "_meta.updated_on": new Date(),
              },
            }
          );
          if (res.upsertedCount) {
            logger.info("Nouvel établissement ajouté", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            await acceEtablissements().updateOne(query, {
              $set: {
                "_meta.updated_on": new Date(),
              },
            });

            jobStats.updated++;
            logger.debug("Etablissement mis à jour", query);
          } else {
            logger.trace("Etablissement déjà à jour", query);
          }
        } catch (e) {
          handleError(e, query);
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}

export async function importEtablissements(options = {}) {
  const jobStatsCA = await importCAEtablissements(options);
  const jobStatsACCE = await importACCEEtablissements({
    file: path.join(__dirname, `./../../data/acce_etablissements.csv`),
    ...options,
  });

  return { jobStatsCA, jobStatsACCE };
}
