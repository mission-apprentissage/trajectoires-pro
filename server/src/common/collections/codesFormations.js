import { object, objectId, string, date } from "./schemas/jsonSchemaTypes.js";

export const name = "codesFormations";

export function indexes() {
  return [[{ code_formation: 1 }], [{ "niveau.code": 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_formation: string(),
      niveau: object(
        {
          code: string(),
          diplome: string(),
        },
        { required: ["code", "diplome"] }
      ),
      _meta: object(
        {
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    { required: ["code_formation", "_meta"], additionalProperties: false }
  );
}
