import { logger } from "#src/common/logger.js";
import {
  object,
  objectId,
  string,
  date,
  boolean,
  number,
} from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "metierDepartementales";

function indexes() {
  return [
    [{ code_ogr: 1, code_naf: 1, departement: 1 }, { unique: true }],
    [{ code_ogr: 1 }],
    [{ code_naf: 1 }],
    [{ departement: 1 }],
    [{ title: 1 }],
    [{ code_rome: 1 }],
  ];
}

function schema() {
  return object(
    {
      _id: objectId(),
      code_rome: string(),
      title: string(),
      title_old: string(),
      provenance: string(),
      isMetierAvenir: boolean(),
      isMetierEnTension: boolean(),
      isTransitionEcologique: boolean(),
      isTransitionNumerique: boolean(),
      isTransitionDemographique: boolean(),
      isMetierArt: boolean(),
      code_ogr: string(),
      code_naf: string(),
      departement: string(),
      indiceTensionRecrutement: number(),
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
      required: ["_meta", "code_rome", "code_ogr", "code_naf", "departement", "isMetierAvenir", "title"],
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
