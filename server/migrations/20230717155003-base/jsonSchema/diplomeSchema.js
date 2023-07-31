import { object, string } from "./jsonSchemaTypes.js";

export function diplomeSchema() {
  return object(
    {
      code: string(),
      libelle: string(),
    },
    { required: ["code", "libelle"] }
  );
}
