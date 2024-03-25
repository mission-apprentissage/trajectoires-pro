import { object, objectId, string, boolean, geoJsonPoint } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "etablissement";

export function indexes() {
  return [[{ uai: 1 }, { unique: true }], [{ coordinate: "2dsphere" }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      libelle: string(),
      address: object({
        street: string(),
        postCode: string(),
        city: string(),
        cedex: boolean(),
      }),
      coordinate: geoJsonPoint(),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["uai"],
      additionalProperties: false,
    }
  );
}
