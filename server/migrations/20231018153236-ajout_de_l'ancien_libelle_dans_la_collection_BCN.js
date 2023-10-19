import { omit } from "lodash-es";
import { string } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    libelle_long_ancien: string(),
  },
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  return MongoDB.mergeSchema("bcn", schema);
};

export const down = async (db, client) => {
  const collectionInfos = await db.listCollections({ name: "bcn" }).toArray();
  const validator = collectionInfos[0].options.validator;

  if (!validator) {
    return;
  }

  const oldSchema = validator.$jsonSchema;
  const newSchema = {
    ...oldSchema,
    properties: omit(oldSchema.properties, Object.keys(schema.properties)),
    required: oldSchema.required,
  };

  return db.command({
    collMod: "bcn",
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: newSchema,
    },
  });
};
