import { logger } from "#src/common/logger.js";
import { object, objectId, string, arrayOf, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "cfdRomes";

function indexes() {
  return [[{ code_formation_diplome: 1 }, { unique: true }], [{ romes: 1 }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      code_formation_diplome: string(),
      code_romes: arrayOf(string()),
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
      required: ["code_formation_diplome", "code_romes", "_meta"],
      additionalProperties: false,
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
