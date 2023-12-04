import { string, boolean } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    title_old: string(),
    provenance: string(),
    isMetierEnTension: boolean(),
    isTransitionEcologique: boolean(),
    isTransitionNumerique: boolean(),
    isTransitionDemographique: boolean(),
    isMetierArt: boolean(),
    code_ogr: string(),
  },
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  return MongoDB.mergeSchema("romeMetier", schema);
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  return MongoDB.removeFromSchema("romeMetier", schema);
};
