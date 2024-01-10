import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getBCNTable, getDiplome, getNiveauxDiplome } from "#src/services/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { bcn } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils.js";

const logger = getLoggerWithContext("import");

function fieldsValue(data, niveauxDiplome) {
  const cfd = data["FORMATION_DIPLOME"];

  return {
    code_certification: cfd,
    code_formation_diplome: cfd,
    diplome: getDiplome(cfd, niveauxDiplome),
    date_ouverture: parseAsUTCDate(data["DATE_OUVERTURE"]),
    date_fermeture: parseAsUTCDate(data["DATE_FERMETURE"]),
    ancien_diplome: [],
    nouveau_diplome: [],
  };
}

export async function streamCfds(options = {}) {
  const niveauxDiplome = await getNiveauxDiplome(options);

  return compose(
    mergeStreams(
      await getBCNTable("V_FORMATION_DIPLOME", options), //Apprentissage
      await getBCNTable("N_FORMATION_DIPLOME", options)
    ),
    transformData(async (data) => {
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "cfd",
        libelle: `${data["LIBELLE_COURT"]} ${data["LIBELLE_STAT_33"]}`,
        libelle_long: data["LIBELLE_LONG_200"],
        niveauFormationDiplome: data["NIVEAU_FORMATION_DIPLOME"],
        groupeSpecialite: data["GROUPE_SPECIALITE"],
        lettreSpecialite: data["LETTRE_SPECIALITE"],
      };
    })
  );
}

export async function streamMefs(options = {}) {
  const niveauxDiplome = await getNiveauxDiplome(options);
  const stream = await getBCNTable("N_MEF", options);

  return compose(
    stream,
    transformData(async (data) => {
      const mefstat11 = data["MEF_STAT_11"];
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "mef",
        code_certification: mefstat11,
        libelle: data["LIBELLE_LONG"],
        libelle_long: data["LIBELLE_LONG"],
      };
    })
  );
}

async function importFromStream(stream, stats = { total: 0, created: 0, updated: 0, failed: 0 }) {
  await oleoduc(
    stream,
    writeData(
      async (data) => {
        stats.total++;

        if (!data.diplome) {
          logger.warn(`Diplome inconnu pour le code ${data.code_certification}`);
        }

        try {
          const res = await upsert(
            bcn(),
            {
              code_certification: data.code_certification,
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

          if (res.upsertedCount) {
            logger.info(`Nouveau code ${data.code_certification} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Code ${data.code_certification} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Code ${data.code_certification} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le code ${data.code_certification}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}

export async function importBCN(options = {}) {
  logger.info(`Importation des formations depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  await importFromStream(await streamCfds(options), stats);
  await importFromStream(await streamMefs(options), stats);

  return stats;
}
