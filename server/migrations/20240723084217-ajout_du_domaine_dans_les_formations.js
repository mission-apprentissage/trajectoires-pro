import { string, arrayOf, object } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const name = "formation";
const schema = {
  properties: {
    codeRncp: string(),
    domaines: arrayOf(
      object({
        domaine: string(),
        sousDomaine: string(),
      })
    ),
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
