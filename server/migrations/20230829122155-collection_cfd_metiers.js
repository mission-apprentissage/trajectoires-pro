import { logger } from "#src/common/logger.js";
import {
  object,
  objectId,
  string,
  date,
  arrayOf,
  boolean,
} from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "cfdMetiers";

function indexes() {
  return [[{ code_formation_diplome: 1 }, { unique: true }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      code_formation_diplome: string(),
      code_romes: arrayOf(string()),
      metiers: arrayOf(
        object(
          {
            title: string(),
            isMetierAvenir: boolean(),
            code_rome: string(),
          },
          {
            required: ["title", "isMetierAvenir", "code_rome"],
            additionalProperties: false,
          }
        )
      ),
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
      required: ["code_formation_diplome", "code_romes", "metiers", "_meta"],
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
