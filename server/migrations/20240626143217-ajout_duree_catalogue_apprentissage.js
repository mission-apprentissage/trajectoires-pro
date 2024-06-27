import { string } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const name = "catalogueApprentissageFormations";
const schema = {
  properties: {
    duree: string(),
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
