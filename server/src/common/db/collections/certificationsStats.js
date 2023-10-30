import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaIJSchema } from "./jsonSchema/metaSchema.js";
import * as Stats from "./jsonSchema/statsSchema.js";
import * as Continuum from "./jsonSchema/continuumSchema.js";
import * as Certification from "./jsonSchema/certificationSchema.js";

export const name = "certificationsStats";

export function indexes() {
  return [[{ millesime: 1, code_certification: 1 }, { unique: true }], [{ millesime: 1 }], ...Certification.indexes()];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      millesime: string(),
      ...Certification.fields(),
      ...Stats.fields(),
      ...Continuum.fields(),
      _meta: metaSchema([metaIJSchema()]),
    },
    {
      required: ["millesime", ...Certification.required(), ...Continuum.required()],
      additionalProperties: false,
    }
  );
}
