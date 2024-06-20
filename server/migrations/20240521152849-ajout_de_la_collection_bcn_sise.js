import { logger } from "#src/common/logger.js";
import { object, objectId, string, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "bcn_sise";

function indexes() {
  return [[{ diplome_sise: 1 }, { unique: true }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      diplome_sise: string(),
      type_diplome_sise: string(),
      voie_lmd: string(),
      domaine_formation: string(),
      libelle_intitule_1: string(),
      libelle_intitule_2: string(),
      groupe_specialite: string(),
      lettre_specialite: string(),
      secteur_disciplinaire_sise: string(),
      cite_domaine_formation: string(),
      duree: string(),
      nature_diplome_sise: string(),

      date_ouverture: date(),
      date_fermeture: date(),
      date_intervention: date(),

      definitif: string(),
      n_commentaire: string(),
      categorie_formation_sise: string(),
      cite_domaine_detaille: string(),
      secteur_discipl_detail_sise: string(),

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
      required: ["diplome_sise", "type_diplome_sise", "libelle_intitule_1", "_meta"],
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
