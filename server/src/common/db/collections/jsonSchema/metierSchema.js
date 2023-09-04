import { object, string, boolean } from "./jsonSchemaTypes.js";

export function metierSchema() {
  return object(
    {
      title: string(),
      isMetierAvenir: boolean(),
      code_rome: string(),
    },
    {
      required: ["title", "isMetierAvenir", "code_rome"],
      additionalProperties: false,
    }
  );
}
