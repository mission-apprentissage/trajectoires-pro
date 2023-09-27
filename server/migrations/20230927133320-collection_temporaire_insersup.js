import { logger } from "#src/common/logger.js";
import {
  object,
  objectId,
  string,
  number,
  integer,
  arrayOf,
} from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

export const name = "tmpInsersup";

export function indexes() {
  return [[{ diplome: 1 }], [{ etablissement: 1 }], [{ libelle_diplome: 1 }], [{ annees_universitaire: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      diplome: string(),
      libelle_diplome: string(),
      type_diplome_long: string(),
      etablissement: string(),
      denomination_principale: string(),
      diplomes: integer(),
      sortants: integer(),
      poursuivants: integer(),
      taux_poursuivant: number(),
      in_dsn_6: integer(),
      in_dsn_12: integer(),
      in_dsn_18: integer(),
      in_dsn_24: integer(),
      in_dsn_30: integer(),
      taux_in_dsn_6: number(),
      taux_in_dsn_12: number(),
      taux_in_dsn_18: number(),
      taux_in_dsn_24: number(),
      taux_in_dsn_30: number(),
      annee_universitaire: string(),
      annees_universitaire: arrayOf(string()),
    },
    {
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
