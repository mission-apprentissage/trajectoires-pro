import { string } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const name = "etablissement";
const schema = {
  properties: {
    statut: string(),
    statutDetail: string(),
    url: string(),
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
