import { omit, without } from "lodash-es";
import { object, string, enumOf } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    donnee_source: object(
      {
        code_certification: string(),
        type: enumOf(["self", "ancienne", "nouvelle"]),
      },
      { required: ["code_certification", "type"] }
    ),
  },
  required: ["donnee_source"],
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  return Promise.all([
    MongoDB.mergeSchema("certificationsStats", schema),
    MongoDB.mergeSchema("formationsStats", schema),
    MongoDB.mergeSchema("regionalesStats", schema),
  ]);
};

export const down = async (db, client) => {
  return Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      const collectionInfos = await db.listCollections({ name: collection }).toArray();
      const validator = collectionInfos[0].options.validator;

      if (!validator) {
        return;
      }

      const oldSchema = validator.$jsonSchema;
      const newSchema = {
        ...oldSchema,
        properties: omit(oldSchema.properties, Object.keys(schema.properties)),
        required: without(oldSchema.required || [], ...schema.required),
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
