import { object, string } from "./jsonSchemaTypes.js";

export function regionSchema() {
  return object(
    {
      code: string(),
      nom: string(),
    },
    { required: ["code", "nom"] }
  );
}
