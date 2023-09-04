import { object, objectId } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";
import { metierSchema } from "./jsonSchema/metierSchema.js";
import { mergeWith, isArray } from "lodash-es";

export const name = "romeMetier";

export function indexes() {
  return [[{ code_rome: 1, title: 1 }, { unique: true }], [{ isMetierAvenir: 1 }]];
}

export function schema() {
  return mergeWith(
    {},
    metierSchema(),
    object(
      {
        _id: objectId(),
        _meta: metaSchema([metaImportSchema()]),
      },
      {
        required: ["_meta"],
        additionalProperties: false,
      }
    ),
    (obj, src) => (isArray(obj) ? obj.concat(src) : undefined)
  );
}
