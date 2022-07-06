import { date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";

export const name = "bcn";

export function indexes() {
  return [[{ code_certification: 1 }, { unique: true }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      type: string({ enum: ["mef", "cfd"] }),
      code_certification: string(),
      code_formation_diplome: string(),
      date_fermeture: date(),
      libelle: string(),
      diplome: diplomeSchema(),
      _meta: object(
        {
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: ["type", "code_certification", "code_formation_diplome", "libelle", "_meta"],
      additionalProperties: true,
    }
  );
}
