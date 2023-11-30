import { arrayOf, object, string, boolean } from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";
import * as MongoDB from "#src/common/db/mongodb.js";

const schema = {
  properties: {
    metiers: arrayOf(
      object(
        {
          title: string(),
          title_old: string(),
          provenance: string(),
          code_rome: string(),
          isMetierAvenir: boolean(),
          isMetierEnTension: boolean(),
          isTransitionEcologique: boolean(),
          isTransitionNumerique: boolean(),
          isTransitionDemographiqu: boolean(),
          isMetierArt: boolean(),
          code_ogr: string(),
        },
        {
          required: ["title", "isMetierAvenir", "code_rome"],
          additionalProperties: false,
        }
      )
    ),
  },
};

export const up = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  return MongoDB.mergeSchema("cfdMetiers", schema);
};

export const down = async (db, client) => {
  MongoDB.setMongoDBClient(client);
  return MongoDB.removeFromSchema("cfdMetiers", schema);
};
