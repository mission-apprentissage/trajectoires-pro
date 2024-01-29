import { logger } from "#src/common/logger.js";
import {
  object,
  objectId,
  string,
  date,
  arrayOf,
  boolean,
} from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
const name = "catalogueApprentissageFormations";

function indexes() {
  return [
    [{ id: 1 }, { unique: true }],
    [{ uai_formation: 1 }],
    [{ etablissement_gestionnaire_uai: 1 }],
    [
      {
        etablissement_formateur_uai: 1,
      },
    ],
    [{ cfd: 1 }],
    [{ cfd: 1, uai_formation: 1 }],
    [{ cfd: 1, etablissement_gestionnaire_uai: 1 }],
    [{ cfd: 1, etablissement_formateur_uai: 1 }],
  ];
}

function schema() {
  return object(
    {
      _id: objectId(),
      etablissement_gestionnaire_id: objectId(),
      etablissement_gestionnaire_siret: string(),
      etablissement_gestionnaire_enseigne: string(),
      etablissement_gestionnaire_uai: string(),
      etablissement_gestionnaire_entreprise_raison_sociale: string(),
      etablissement_gestionnaire_siren: string(),
      etablissement_formateur_id: objectId(),
      etablissement_formateur_siret: string(),
      etablissement_formateur_enseigne: string(),
      etablissement_formateur_uai: string(),
      etablissement_formateur_entreprise_raison_sociale: string(),
      etablissement_formateur_siren: string(),
      etablissement_reference: string(),
      cfd: string(),
      cfd_specialite: string(),
      cfd_outdated: boolean(),
      cfd_date_fermeture: date(),
      nom_academie: string(),
      num_academie: string(),
      code_postal: string(),
      code_commune_insee: string(),
      num_departement: string(),
      nom_departement: string(),
      region: string(),
      localite: string(),
      uai_formation: string(),
      nom: string(),
      intitule_long: string(),
      intitule_court: string(),
      diplome: string(),
      niveau: string(),
      libelle_court: string(),
      bcn_mefs_10: arrayOf(
        object({
          date_fermeture: date(),
          mef10: string(),
          modalite: object({
            duree: string(),
            annee: string(),
          }),
        })
      ),
      id: objectId(),
      _meta: object(
        {
          created_on: date(),
          updated_on: date(),
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: ["id", "_meta", "cfd"],
      additionalProperties: true,
    }
  );
}

export const up = async (db) => {
  let collections = await db.listCollections().toArray();
  if (!collections.find((c) => c.name === name)) {
    await db.createCollection(name);
  }
  logger.debug(`Configuring indexes for collection ${name}...`);
  let dbCol = db.collection(name);
  await Promise.all(
    indexes().map(([index, options]) => {
      return dbCol.createIndex(index, options);
    })
  );
  logger.debug(`Configuring validation for collection ${name}...`);
  await db.command({
    collMod: name,
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: schema(),
    },
  });
};

export const down = async () => {
  // We do not remove the collection to avoid deleting data by error
};
