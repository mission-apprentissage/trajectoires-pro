import { arrayOf, date, object, objectId, string } from "./schemas/jsonSchemaTypes.js";
import { diplomeSchema } from "./schemas/diplomeSchema.js";

export const name = "cfd";

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
        "code_formation_alternatifs",
        "mef",
        "mef_stats_9",
        "mef_stats_11",
        "libelle",
        "_meta",
      ],
      additionalProperties: false,
    }
  );
}
