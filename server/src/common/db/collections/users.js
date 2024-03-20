import { object, objectId, string, arrayOf, number } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema } from "./jsonSchema/metaSchema.js";

export const name = "users";

export function indexes() {
  return [[{ username: 1 }, { unique: true }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      username: string(),
      password: string(),
      widget: object({
        hash: string(),
        version: arrayOf(
          object({
            type: string(),
            theme: string(),
            version: number(),
          })
        ),
      }),
      _meta: metaSchema(),
    },
    {
      required: ["username", "password", "widget", "_meta"],
      additionalProperties: false,
    }
  );
}
