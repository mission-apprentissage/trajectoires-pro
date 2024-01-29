import { string, arrayOf, enumOf } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    uai_type: enumOf(["lieu_formation", "formateur", "gestionnaire", "inconnu"]),
    uai_lieu_formation: arrayOf(string()),
    uai_formateur: arrayOf(string()),
    uai_gestionnaire: arrayOf(string()),
    uai_donnee: string(),
    uai_donnee_type: enumOf(["lieu_formation", "formateur", "gestionnaire", "inconnu"]),
  },
};

const indexes = [[{ user: 1 }]];

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.mergeSchema("formationsStats", schema);
  await Promise.all(
    indexes.map(([index, options]) => {
      return db.collection("formationsStats").createIndex(index, options);
    })
  );
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  await MongoDB.removeFromSchema("formationsStats", schema);
};
