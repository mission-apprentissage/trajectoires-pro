import { omit, without, uniq } from "lodash-es";
import { boolean, string, object, arrayOf } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    familleMetier: object(
      {
        code: string(),
        libelle: string(),
        isAnneeCommune: boolean(),
      },
      { required: ["code", "libelle", "isAnneeCommune"] }
    ),
    certificationsTerminales: arrayOf(
      object(
        {
          code_certification: string(),
        },
        { required: ["code_certification"] }
      )
    ),
  },
  required: [],
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all([
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
