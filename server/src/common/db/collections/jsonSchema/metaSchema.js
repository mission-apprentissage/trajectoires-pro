import { date, integer, object } from "./jsonSchemaTypes.js";

export function metaSchema() {
  return object(
    {
      date_import: date(),
      inserjeunes: object({
        taux_poursuite_etudes: integer(),
        taux_emploi_24_mois: integer(),
        taux_emploi_18_mois: integer(),
        taux_emploi_12_mois: integer(),
        taux_emploi_6_mois: integer(),
      }),
    },
    { required: ["date_import"] }
  );
}
