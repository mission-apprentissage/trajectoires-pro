import { object, string } from "./jsonSchemaTypes.js";

export function departementSchema() {
  return object(
    {
      code: string(),
      nom: string(),
    },
    { required: ["code", "nom"] }
  );
}
