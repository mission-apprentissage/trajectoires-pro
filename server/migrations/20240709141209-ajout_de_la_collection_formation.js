import { logger } from "#src/common/logger.js";
import { object, objectId, string, enumOf, date } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "formation";

function indexes() {
  return [[{ cfd: 1, codeDispositif: 1, voie: 1 }, { unique: true }], [{ cfd: 1 }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      cfd: string(),
      codeDispositif: string(),
      codeDiplome: string(),
      mef11: string(),
      voie: enumOf(["scolaire", "apprentissage"]),
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
      required: ["cfd", "voie"],
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
