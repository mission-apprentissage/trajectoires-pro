import { object, objectId, string, enumOf } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "formation";

export function indexes() {
  return [[{ cfd: 1, codeDispositif: 1, voie: 1 }, { unique: true }], [{ cfd: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      cfd: string(),
      codeDispositif: string(),
      codeDiplome: string(),
      mef11: string(),
      voie: enumOf(["scolaire", "apprentissage"]),
      libelle: string(),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["cfd", "voie"],
      additionalProperties: false,
    }
  );
}
