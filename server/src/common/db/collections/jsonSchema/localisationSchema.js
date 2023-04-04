import { object, string } from "./jsonSchemaTypes.js";
import { departementSchema } from "./departementSchema.js";

export function indexes() {
  return [
    [{ "localisation.departement.code": 1 }],
    [{ "localisation.code_postal": 1 }],
    [{ "localisation.code_commune": 1 }],
  ];
}

export function schema() {
  return object(
    {
      departement: departementSchema(),
      code_postal: string(),
      code_commune: string(),
      nom_commune: string(),
    },
    { required: ["departement", "code_postal", "code_commune", "nom_commune"] }
  );
}
