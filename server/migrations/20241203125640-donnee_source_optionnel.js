import { omit, without, uniq } from "lodash-es";
import { boolean, string, object } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
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
        required: uniq(oldSchema.required.filter((k) => k !== "donnee_source")),
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
        required: uniq([...oldSchema.required, "donnee_source"]),
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
