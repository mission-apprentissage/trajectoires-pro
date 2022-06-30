import { arrayOf, date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";

export const name = "cfds";

export function indexes() {
  return [[{ code_formation: 1 }, { unique: true }], [{ code_formation_alternatifs: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_formation: string(),
      libelle: string(),
      code_formation_alternatifs: arrayOf(string()),
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
      required: ["code_formation", "libelle", "code_formation_alternatifs", "_meta"],
      additionalProperties: false,
    }
  );
}
