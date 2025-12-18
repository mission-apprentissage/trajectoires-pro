import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getDiplome, getNiveauxDiplome } from "#src/services/bcn/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { bcn } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils.js";
import { BCNApi } from "#src/services/bcn/BCNApi.js";

const logger = getLoggerWithContext("import");

function fieldsValue(data, niveauxDiplome) {
  const cfd = data["formation_diplome"];

  return {
    code_certification: cfd,
    code_formation_diplome: cfd,
    diplome: getDiplome(cfd, niveauxDiplome),
    date_ouverture: parseAsUTCDate(data["date_ouverture"]),
    date_fermeture: parseAsUTCDate(data["date_fermeture"]),
    ancien_diplome: [],
    nouveau_diplome: [],
  };
}

export async function streamCfds(bcnApi) {
  const niveauxDiplome = await getNiveauxDiplome(bcnApi);

  return compose(
    mergeStreams(
      await bcnApi.fetchNomenclature("V_FORMATION_DIPLOME"), //Apprentissage
      await bcnApi.fetchNomenclature("N_FORMATION_DIPLOME")
    ),
    transformData(async (data) => {
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "cfd",
        libelle: `${data["libelle_court"]} ${data["libelle_stat_33"]}`,
        libelle_long: data["libelle_long_200"],
        niveauFormationDiplome: data["niveau_formation_diplome"],
        groupeSpecialite: data["groupe_specialite"],
        lettreSpecialite: data["lettre_specialite"],
      };
    })
  );
}

export async function streamMefs(bcnApi) {
  const niveauxDiplome = await getNiveauxDiplome(bcnApi);
  const stream = await bcnApi.fetchNomenclature("N_MEF");

  return compose(
    stream,
    transformData(async (data) => {
      const mefstat11 = data["mef_stat_11"];
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "mef",
        code_certification: mefstat11,
        libelle: data["libelle_long"],
        libelle_long: data["libelle_long"],
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

export async function importBCN() {
  logger.info(`Importation des formations depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const bcnApi = new BCNApi();
  await importFromStream(await streamCfds(bcnApi), stats);
  await importFromStream(await streamMefs(bcnApi), stats);

  return stats;
}
