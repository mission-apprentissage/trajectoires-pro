import { date, object, objectId } from "./schemas/jsonSchemaTypes.js";
import { certificationFields } from "./schemas/certificationFields.js";

export const name = "certifications";

export function indexes() {
  return [[{ code_formation: 1 }, { unique: true }], [{ "alias.code": 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      ...certificationFields(),
      _meta: object(
        {
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    { required: ["code_formation", "alias", "_meta"], additionalProperties: false }
  );
}
