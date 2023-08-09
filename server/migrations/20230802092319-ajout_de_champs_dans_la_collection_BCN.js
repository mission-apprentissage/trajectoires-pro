import { omit, without } from "lodash-es";
import { arrayOf, date, string } from "../src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "../src/common/db/mongodb.js";

const schema = {
  properties: {
    libelle_long: string(),
    date_ouverture: date(),
    date_premiere_session: string(),
    date_derniere_session: string(),
    ancien_diplome: arrayOf(string()),
    nouveau_diplome: arrayOf(string()),
  },
  required: ["libelle_long"],
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
    required: without(oldSchema.required, ...schema.required),
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
