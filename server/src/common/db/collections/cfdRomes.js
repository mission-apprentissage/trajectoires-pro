import { object, objectId, string, arrayOf } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "cfdRomes";

export function indexes() {
  return [[{ code_formation_diplome: 1 }, { unique: true }], [{ romes: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_formation_diplome: string(),
      code_romes: arrayOf(string()),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["code_formation_diplome", "code_romes", "_meta"],
      additionalProperties: false,
    }
  );
}
