import { merge } from "lodash-es";
import { date, integer, object } from "./jsonSchemaTypes.js";

export function metaBCNSchema() {
  return object(
    {
      date_import: date(),
    },
    { required: ["date_import"] }
  );
}

export function metaIJSchema() {
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

export function metaSchema(additionalSchema = []) {
  return merge(
    object(
      {
        created_on: date(),
        updated_on: date(),
      },
      {}
    ),
    ...additionalSchema
  );
}
