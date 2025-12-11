import { date, string, object, integer } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const oldSchema = {
  properties: {
    filiere: string({ enum: ["apprentissage", "pro", "superieur"] }),
  },
};

const schema = {
  properties: {
    filiere: string({ enum: ["apprentissage", "pro", "superieur", "agricole"] }),
  },
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      await Promise.all([MongoDB.mergeSchema(collection, schema)]);
    })
  );
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await Promise.all(
    ["certificationsStats", "formationsStats", "regionalesStats"].map(async (collection) => {
      // Remove agricole
      await MongoDB.dbCollection(collection).deleteMany({ filiere: "agricole" });
      await MongoDB.mergeSchema(collection, oldSchema);
    })
  );
};
