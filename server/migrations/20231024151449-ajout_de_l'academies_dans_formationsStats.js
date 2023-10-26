import { object, string } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    academie: object(
      {
        code: string(),
        nom: string(),
      },
      { required: ["code", "nom"] }
    ),
  },
  required: ["academie"],
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);

  await MongoDB.mergeSchema("formationsStats", schema);
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.removeFromSchema("formationsStats", schema);
};
