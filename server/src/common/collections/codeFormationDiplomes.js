import { arrayOf, date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";

export const name = "codeFormationDiplomes";

export function indexes() {
  return [
    [{ code_formation: 1 }, { unique: true }],
    [{ code_formation_alternatifs: 1 }],
    [{ mef: 1 }],
    [{ mef_stats_9: 1 }],
    [{ mef_stats_11: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_formation: string(),
      libelle: string(),
      code_formation_alternatifs: arrayOf(string()),
      mef: arrayOf(string()),
      mef_stats_9: arrayOf(string()),
      mef_stats_11: arrayOf(string()),
      diplome: diplomeSchema(),
      _meta: object(
        {
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: [
        "code_formation",
        "libelle",
        "code_formation_alternatifs",
        "mef",
        "mef_stats_9",
        "mef_stats_11",
        "_meta",
      ],
      additionalProperties: false,
    }
  );
}
