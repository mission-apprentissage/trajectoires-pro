import { oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getBCNTable, getDiplomeSup, getTypeDiplomeSise } from "#src/services/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { bcnSise } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils.js";
import { fromPairs } from "lodash-es";

const logger = getLoggerWithContext("import");

function fieldsValue(data, typesDiplome) {
  const FIELDS_MAPPER = {
    DIPLOME_SISE: "diplome_sise",
    TYPE_DIPLOME_SISE: "type_diplome_sise",
    VOIE_LMD: "voie_lmd",
    DOMAINE_FORMATION: "domaine_formation",
    LIBELLE_INTITULE_1: "libelle_intitule_1",
    LIBELLE_INTITULE_2: "libelle_intitule_2",
    GROUPE_SPECIALITE: "groupe_specialite",
    LETTRE_SPECIALITE: "lettre_specialite",
    SECTEUR_DISCIPLINAIRE_SISE: "secteur_disciplinaire_sise",
    CITE_DOMAINE_FORMATION: "cite_domaine_formation",
    DUREE: "duree",
    NATURE_DIPLOME_SISE: "nature_diplome_sise",
    DATE_OUVERTURE: "date_ouverture",
    DATE_FERMETURE: "date_fermeture",
    DATE_INTERVENTION: "date_intervention",
    DEFINITIF: "definitif",
    N_COMMENTAIRE: "n_commentaire",
    CATEGORIE_FORMATION_SISE: "categorie_formation_sise",
    CITE_DOMAINE_DETAILLE: "cite_domaine_detaille",
    SECTEUR_DISCIPL_DETAIL_SISE: "secteur_discipl_detail_sise",
  };

  return {
    ...fromPairs(
      Object.keys(FIELDS_MAPPER).map((k) => {
        const value = ["DATE_OUVERTURE", "DATE_FERMETURE", "DATE_INTERVENTION"].includes(k)
          ? parseAsUTCDate(data[k])
          : data[k];
        return [FIELDS_MAPPER[k], value];
      })
    ),
    diplome: getDiplomeSup(data["TYPE_DIPLOME_SISE"], typesDiplome),
  };
}

export async function importBCNSise(options = {}) {
  logger.info(`Importation des formations du superieur depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const typesDiplome = await getTypeDiplomeSise(options);

  await oleoduc(
    await getBCNTable("N_DIPLOME_SISE", options),
    transformData(async (data) => fieldsValue(data, typesDiplome)),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            bcnSise(),
            { diplome_sise: data.diplome_sise },
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
            logger.info(`Nouveau code ${data.diplome_sise} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Code ${data.diplome_sise} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Code ${data.diplome_sise} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le code ${data.diplome_sise}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
