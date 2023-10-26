import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import * as Stats from "./jsonSchema/statsSchema.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import { academieSchema } from "./jsonSchema/academieSchema.js";
import * as Continuum from "./jsonSchema/continuumSchema.js";
import { metaSchema, metaIJSchema } from "./jsonSchema/metaSchema.js";
import * as Certification from "./jsonSchema/certificationSchema.js";

export const name = "formationsStats";

export function indexes() {
  return [
    [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ uai: 1 }],
    [{ millesime: 1 }],
    ...Certification.indexes(),
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      millesime: string(),
      region: regionSchema(),
      academie: academieSchema(),
      ...Certification.fields(),
      ...Stats.fields(),
      ...Continuum.fields(),
      _meta: metaSchema([metaIJSchema()]),
    },
    {
      required: ["uai", "millesime", "region", "academie", ...Certification.required(), ...Continuum.required()],
      additionalProperties: false,
    }
  );
}
