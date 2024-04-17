import { logger } from "#src/common/logger.js";
import { object, objectId, string, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "onisepRaw";

function indexes() {
  return [[{ type: 1, key: 1, millesime: 1 }, { unique: true }], [{ type: 1 }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      dataset: string(),
      type: string(),
      key: string(),
      millesime: string(),
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
      required: ["type", "dataset", "key", "millesime", "_meta"],
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
