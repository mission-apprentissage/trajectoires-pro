import { string } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    user: string(),
  },
};

const indexes = [[{ user: 1 }]];

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.mergeSchema("metrics", schema);
  await Promise.all(
    indexes.map(([index, options]) => {
      return db.collection("metrics").createIndex(index, options);
    })
  );
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.removeFromSchema("metrics", schema);
};
