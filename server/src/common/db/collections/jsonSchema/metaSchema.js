import { merge } from "lodash-es";
import { date, integer, object } from "./jsonSchemaTypes.js";

export function metaImportSchema() {
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
        DEVENIR_part_autre_situation_6_mois: integer(),
        DEVENIR_part_en_emploi_6_mois: integer(),
        DEVENIR_part_poursuite_etudes: integer(),
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
