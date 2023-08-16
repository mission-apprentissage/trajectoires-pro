import { logger } from "../src/common/logger.js";
import { object, objectId, string, date } from "../src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "bcn_mef";

function indexes() {
  return [[{ mef_stat_11: 1 }, { unique: true }], [{ mef: 1 }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      mef_stat_11: string(),
      mef: string(),
      dispositif_formation: string(),
      formation_diplome: string(),
      duree_dispositif: string(),
      annee_dispositif: string(),

      libelle_court: string(),
      libelle_long: string(),

      date_ouverture: date(),
      date_fermeture: date(),

      statut_mef: string(),
      nb_option_obligatoire: string(),
      nb_option_facultatif: string(),
      renforcement_langue: string(),
      duree_projet: string(),
      duree_stage: string(),
      horaire: string(),
      mef_inscription_scolarite: string(),
      mef_stat_9: string(),

      date_intervention: date(),
      libelle_edition: string(),
      commentaire: string(),
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
      required: [
        "mef",
        "dispositif_formation",
        "formation_diplome",
        "duree_dispositif",
        "annee_dispositif",
        "mef_stat_11",
        "libelle_court",
        "libelle_long",
        "_meta",
      ],
      additionalProperties: true,
    }
  );
}

export const up = async (db, client) => {
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

export const down = async (db, client) => {
  // We do not remove the collection to avoid deleting data by error
};
