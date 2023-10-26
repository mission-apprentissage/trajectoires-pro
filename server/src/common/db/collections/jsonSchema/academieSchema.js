import { object, string } from "./jsonSchemaTypes.js";

export function academieSchema() {
  return object(
    {
      code: string(),
      nom: string(),
    },
    { required: ["code", "nom"] }
  );
}
