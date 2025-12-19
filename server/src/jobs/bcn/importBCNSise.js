import { oleoduc, transformData, writeData, mergeStreams } from "oleoduc";
import { Readable } from "stream";
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

function getSiseFictif() {
  // Insersup a créé des SISE fictif pour certaine spécialité de BUT
  // On injecte ces SISE dans la BDD

  return [
    {
      diplome_sise: "0000001",
      type_diplome_sise: "DR",
      voie_lmd: null,
      domaine_formation: null,
      libelle_intitule_1: "CARRIERES SOCIALES",
      libelle_intitule_2: null,
      groupe_specialite: "335",
      lettre_specialite: "M",
      secteur_disciplinaire_sise: "35",
      cite_domaine_formation: "760",
      duree: null,
      nature_diplome_sise: null,
      date_ouverture: "2021-09-01 00:00:00",
      date_fermeture: null,
      date_intervention: "2021-09-01 00:00:00",
      definitif: "O",
      n_commentaire: null,
      categorie_formation_sise: null,
      cite_domaine_detaille: "0923",
      secteur_discipl_detail_sise: "35",
    },
    {
      diplome_sise: "0000002",
      type_diplome_sise: "DR",
      voie_lmd: null,
      domaine_formation: null,
      libelle_intitule_1: "INFORMATION-COMMUNICATION",
      libelle_intitule_2: null,
      groupe_specialite: "320",
      lettre_specialite: "M",
      secteur_disciplinaire_sise: "35",
      cite_domaine_formation: "320",
      duree: null,
      nature_diplome_sise: null,
      date_ouverture: "2021-09-01 00:00:00",
      date_fermeture: null,
      date_intervention: "2021-09-01 00:00:00",
      definitif: "O",
      n_commentaire: null,
      categorie_formation_sise: null,
      cite_domaine_detaille: "0322",
      secteur_discipl_detail_sise: "35",
    },
    {
      diplome_sise: "0000003",
      type_diplome_sise: "DR",
      voie_lmd: null,
      domaine_formation: null,
      libelle_intitule_1: "GENIE BIOLOGIQUE",
      libelle_intitule_2: null,
      groupe_specialite: "331",
      lettre_specialite: "R",
      secteur_disciplinaire_sise: "06",
      cite_domaine_formation: "722",
      duree: null,
      nature_diplome_sise: null,
      date_ouverture: "2021-09-01 00:00:00",
      date_fermeture: null,
      date_intervention: "2021-09-01 00:00:00",
      definitif: "O",
      n_commentaire: null,
      categorie_formation_sise: null,
      cite_domaine_detaille: "0915",
      secteur_discipl_detail_sise: "06",
    },
  ];
}

export async function importBCNSise() {
  logger.info(`Importation des formations du superieur depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const bcnApi = new BCNApi();
  const typesDiplome = await getTypeDiplomeSise(bcnApi);

  await oleoduc(
    mergeStreams(await bcnApi.fetchNomenclature("N_DIPLOME_SISE"), Readable.from(getSiseFictif())),
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
