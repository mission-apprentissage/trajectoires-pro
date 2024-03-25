import { object, objectId, string, arrayOf, enumOf } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "formationEtablissement";

export function indexes() {
  return [[{ uai: 1, cfd: 1, codeDispositif: 1, voie: 1 }, { unique: true }], [{ uai: 1 }], [{ cfd: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      cfd: string(),
      codeDispositif: string(),
      voie: enumOf(["scolaire", "apprentissage"]),
      millesime: arrayOf(string()),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["uai", "cfd", "voie", "millesime"],
      additionalProperties: false,
    }
  );
}
