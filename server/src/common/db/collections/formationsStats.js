import { object, string } from "./jsonSchema/jsonSchemaTypes.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import * as localisation from "./jsonSchema/localisationSchema.js";

import * as defaultSchema from "./jsonSchema/defaultSchema.js";

export const name = "formationsStats";

export function indexes() {
  return [
    ...defaultSchema.indexes(),
    ...localisation.indexes(),
    [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ uai: 1 }],
  ];
}

export function schema() {
  return object(
    {
      ...defaultSchema.fields(),
      uai: string(),
      region: regionSchema(),
      localisation: localisation.schema(),
    },
    {
      required: [...defaultSchema.required(), "uai", "region"],
      additionalProperties: false,
    }
  );
}
