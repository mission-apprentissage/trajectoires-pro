import { date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";

export const name = "mefs";

export function indexes() {
  return [[{ mef: 1 }, { unique: true }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      mef: string(),
      mef_stat_9: string(),
      mef_stat_11: string(),
      libelle: string(),
      code_formation_diplome: string(),
      date_fermeture: date(),
      diplome: diplomeSchema(),
      _meta: object(
        {
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: ["mef", "mef_stat_9", "mef_stat_11", "libelle", "code_formation_diplome", "_meta"],
      additionalProperties: false,
    }
  );
}
