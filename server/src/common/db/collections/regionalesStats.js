import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { regionSchema } from "./jsonSchema/regionSchema.js";
import * as Stats from "./jsonSchema/statsSchema.js";
import { metaSchema, metaIJSchema, metaInserSupSchema } from "./jsonSchema/metaSchema.js";
import * as Continuum from "./jsonSchema/continuumSchema.js";
import * as Certification from "./jsonSchema/certificationSchema.js";

export const name = "regionalesStats";

export function indexes() {
  return [
    [{ "region.code": 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ "region.code": 1 }],
    [{ millesime: 1 }],
    ...Certification.indexes(),
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      region: regionSchema(),
      millesime: string(),
      ...Certification.fields(),
      ...Stats.fields(),
      ...Continuum.fields(),
      _meta: metaSchema([metaIJSchema(), metaInserSupSchema()]),
    },
    {
      required: ["region", "millesime", ...Certification.required(), ...Continuum.required()],
      additionalProperties: false,
    }
  );
}
