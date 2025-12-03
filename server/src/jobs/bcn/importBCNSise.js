import { oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getDiplomeSup, getTypeDiplomeSise } from "#src/services/bcn/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { bcnSise } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils.js";
import { fromPairs } from "lodash-es";
import { BCNApi } from "#src/services/bcn/BCNApi.js";

const logger = getLoggerWithContext("import");

function fieldsValue(data, typesDiplome) {
  const FIELDS_MAPPER = {
    diplome_sise: "diplome_sise",
    type_diplome_sise: "type_diplome_sise",
    voie_lmd: "voie_lmd",
    domaine_formation: "domaine_formation",
    libelle_intitule_1: "libelle_intitule_1",
    libelle_intitule_2: "libelle_intitule_2",
    groupe_specialite: "groupe_specialite",
    lettre_specialite: "lettre_specialite",
    secteur_disciplinaire_sise: "secteur_disciplinaire_sise",
    cite_domaine_formation: "cite_domaine_formation",
    duree: "duree",
    nature_diplome_sise: "nature_diplome_sise",
    date_ouverture: "date_ouverture",
    date_fermeture: "date_fermeture",
    date_intervention: "date_intervention",
    definitif: "definitif",
    n_commentaire: "n_commentaire",
    categorie_formation_sise: "categorie_formation_sise",
    cite_domaine_detaille: "cite_domaine_detaille",
    secteur_discipl_detail_sise: "secteur_discipl_detail_sise",
  };

  return {
    ...fromPairs(
      Object.keys(FIELDS_MAPPER).map((k) => {
        const value = ["date_ouverture", "date_fermeture", "date_intervention"].includes(k)
          ? parseAsUTCDate(data[k])
          : data[k] !== null
            ? `${data[k]}`
            : null;
        return [FIELDS_MAPPER[k], value];
      })
    ),
    diplome: getDiplomeSup(data["type_diplome_sise"], typesDiplome),
  };
}

export async function importBCNSise() {
  logger.info(`Importation des formations du superieur depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const bcnApi = new BCNApi();
  const typesDiplome = await getTypeDiplomeSise(bcnApi);

  await oleoduc(
    await bcnApi.fetchNomenclature("N_DIPLOME_SISE"),
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
