import { object, objectId, string, number } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";
import { metierSchema } from "./jsonSchema/metierSchema.js";
import { mergeWith, isArray } from "lodash-es";

export const name = "metierDepartementales";

export function indexes() {
  return [
    [{ code_ogr: 1, code_naf: 1, departement: 1 }, { unique: true }],
    [{ code_ogr: 1 }],
    [{ code_naf: 1 }],
    [{ departement: 1 }],
    [{ title: 1 }],
    [{ code_rome: 1 }],
  ];
}

export function schema() {
  return mergeWith(
    {},
    metierSchema(),
    object(
      {
        _id: objectId(),
        code_naf: string(),
        departement: string(),
        indiceTensionRecrutement: number(),
        _meta: metaSchema([metaImportSchema()]),
      },
      {
        required: ["_meta", "code_ogr", "code_naf", "departement"],
        additionalProperties: false,
      }
    ),
    (obj, src) => (isArray(obj) ? obj.concat(src) : undefined)
  );
}
