import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "nafs";

export function indexes() {
  return [[{ code: 1 }, { unique: true }], [{ libelle: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code: string(),
      section: string(),
      division: string(),
      groupe: string(),
      classe: string(),
      sousClasse: string(),
      libelle: string(),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["code", "libelle", "_meta"],
      additionalProperties: false,
    }
  );
}
