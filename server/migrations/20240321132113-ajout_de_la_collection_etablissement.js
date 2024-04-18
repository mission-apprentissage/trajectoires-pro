import { logger } from "#src/common/logger.js";
import {
  object,
  objectId,
  string,
  boolean,
  geoJsonPoint,
  date,
  arrayOf,
} from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "etablissement";

function indexes() {
  return [[{ uai: 1 }, { unique: true }], [{ coordinate: "2dsphere" }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      libelle: string(),
      address: object({
        street: string(),
        postCode: string(),
        city: string(),
        cedex: boolean(),
      }),
      coordinate: geoJsonPoint(),
      journeesPortesOuvertes: object({
        details: string(),
        dates: arrayOf(
          object({
            from: date(),
            to: date(),
            fullDay: boolean(),
            details: string(),
          })
        ),
      }),
      onisep: object({
        id: string(),
      }),
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
      required: ["uai"],
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
