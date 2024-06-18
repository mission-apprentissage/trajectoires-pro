import { string, number, object, enumOf, arrayOf } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const name = "formationEtablissement";
const schema = {
  properties: {
    tags: arrayOf(enumOf(["pour_travailler_rapidement", "pour_continuer_des_etudes", "admission_facile"])),
    indicateurEntree: object(
      {
        rentreeScolaire: string(),
        capacite: number(),
        premiersVoeux: number(),
        effectifs: number(),
        tauxPression: number(),
      },
      {}
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
