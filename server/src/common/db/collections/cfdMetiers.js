import { object, objectId, string, arrayOf } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";
import { metierSchema } from "./jsonSchema/metierSchema.js";
export const name = "cfdMetiers";

export function indexes() {
  return [[{ code_formation_diplome: 1 }, { unique: true }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_formation_diplome: string(),
      code_romes: arrayOf(string()),
      metiers: arrayOf(metierSchema()),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["code_formation_diplome", "code_romes", "metiers", "_meta"],
      additionalProperties: false,
    }
  );
}
