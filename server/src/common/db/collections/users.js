import { object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
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
      _meta: metaSchema(),
    },
    {
      required: ["username", "password", "_meta"],
      additionalProperties: false,
    }
  );
}
