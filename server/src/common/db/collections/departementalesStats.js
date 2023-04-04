import { object } from "./jsonSchema/jsonSchemaTypes.js";
import { departementSchema } from "./jsonSchema/departementSchema.js";

import * as defaultSchema from "./jsonSchema/defaultSchema.js";

export const name = "departementalesStats";

export function indexes() {
  return [
    ...defaultSchema.indexes(),
    [{ "departement.code": 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ "departement.code": 1 }],
  ];
}

export function schema() {
  return object(
    {
      ...defaultSchema.fields(),
      departement: departementSchema(),
    },
    {
      required: [...defaultSchema.required(), "departement"],
      additionalProperties: false,
    }
  );
}
