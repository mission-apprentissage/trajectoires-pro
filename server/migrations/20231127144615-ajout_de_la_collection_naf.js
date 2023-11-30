import { logger } from "#src/common/logger.js";
import { object, objectId, string, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "nafs";

function indexes() {
  return [[{ code: 1 }, { unique: true }], [{ libelle: 1 }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      code: string(),
      section: string(),
      division: string(),
      groupe: string(),
      classe: string(),
      sousClasse: string(),
      libelle: string(),
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
      required: ["code", "libelle", "_meta"],
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
