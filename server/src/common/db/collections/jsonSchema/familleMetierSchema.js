import { object, boolean, string } from "./jsonSchemaTypes.js";

export function familleMetierSchema() {
  return object(
    {
      code: string(),
      libelle: string(),
      isAnneeCommune: boolean(),
    },
    { required: ["code", "libelle", "isAnneeCommune"] }
  );
}
