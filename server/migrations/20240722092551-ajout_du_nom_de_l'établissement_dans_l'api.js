import { omit, without, uniq } from "lodash-es";
import { string } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    libelle_etablissement: string(),
  },
  required: [],
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all([MongoDB.mergeSchema("formationsStats", schema)]);
};

export const down = async (db, client) => {
  return Promise.all(
    ["formationsStats"].map(async (collection) => {
      const collectionInfos = await db.listCollections({ name: collection }).toArray();
      const validator = collectionInfos[0].options.validator;

      if (!validator) {
        return;
      }

      const oldSchema = validator.$jsonSchema;
      const newSchema = {
        ...oldSchema,
        properties: omit(oldSchema.properties, Object.keys(schema.properties)),
        required: uniq(without(oldSchema.required || [], ...schema.required)),
      };

      return db.command({
        collMod: collection,
        validationLevel: "strict",
        validationAction: "error",
        validator: {
          $jsonSchema: newSchema,
        },
      });
    })
  );
};
