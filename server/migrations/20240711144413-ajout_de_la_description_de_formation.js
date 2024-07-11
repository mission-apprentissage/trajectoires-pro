import { string, object } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const name = "formation";
const schema = {
  properties: {
    description: string(),
    onisep: object({
      identifiant: string(),
    }),
  },
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.mergeSchema(name, schema);
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.removeFromSchema(name, schema);
};
