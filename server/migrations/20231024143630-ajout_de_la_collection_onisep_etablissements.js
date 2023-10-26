import { logger } from "#src/common/logger.js";
import { objectId, object, string, number, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "onisepEtablissements";

function indexes() {
  return [[{ code_uai: 1 }, { unique: true }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      code_uai: string(),
      n_siret: string(),
      type_detablissement: string(),
      nom: string(),
      sigle: string(),
      statut: string(),
      tutelle: string(),
      universite_de_rattachement_libelle: string(),
      universite_de_rattachement_id_et_url_onisep: string(),
      etablissements_lies_libelles: string(),
      etablissements_lies_url_et_id_onisep: string(),
      boite_postale: string(),
      adresse: string(),
      cp: string(),
      commune: string(),
      commune_cog: string(),
      cedex: string(),
      telephone: string(),
      arrondissement: string(),
      departement: string(),
      academie: string(),
      region: string(),
      region_cog: string(),
      longitude_x: number(),
      latitude_y: number(),
      journees_portes_ouvertes: string(),
      langues_enseignees: string(),
      label_generation_2024: string(),
      url_et_id_onisep: string(),
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
      required: ["code_uai", "_meta"],
      additionalProperties: false,
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
