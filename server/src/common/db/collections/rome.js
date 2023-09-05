import { object, objectId, string, number } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "rome";

export function indexes() {
  return [[{ code_rome: 1 }, { unique: true }], [{ libelle: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_rome: string(),
      code_ogr: number(),
      libelle: string(),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["code_rome", "code_ogr", "libelle", "_meta"],
      additionalProperties: false,
    }
  );
}
