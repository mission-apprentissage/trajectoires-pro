import { string, arrayOf, object, number } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    widget: object({
      hash: string(),
      version: arrayOf(
        object({
          type: string(),
          theme: string(),
          version: number(),
        })
      ),
    }),
  },
  required: ["widget"],
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.mergeSchema("users", schema);
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.removeFromSchema("users", schema);
};
