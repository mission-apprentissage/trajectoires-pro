import { string, number, object, enumOf, arrayOf } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const name = "formationEtablissement";
const schema = {
  properties: {
    indicateurPoursuite: object({
      millesime: string(),
      taux_en_emploi_6_mois: number(),
      taux_en_formation: number(),
      taux_autres_6_mois: number(),
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
