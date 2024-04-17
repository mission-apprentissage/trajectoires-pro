import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "onisepRaw";

export function indexes() {
  return [[{ type: 1, key: 1, millesime: 1 }, { unique: true }], [{ type: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      dataset: string(),
      type: string(),
      key: string(),
      millesime: string(),
      // data: Raw data in it
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["type", "dataset", "key", "millesime", "_meta"],
      additionalProperties: true,
    }
  );
}
