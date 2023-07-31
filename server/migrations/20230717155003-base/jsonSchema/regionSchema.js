import { object, string } from "./jsonSchemaTypes.js";

export function regionSchema() {
  return object(
    {
      code: string(),
      code_region_academique: string(),
      nom: string(),
    },
    { required: ["code", "nom"] }
  );
}
