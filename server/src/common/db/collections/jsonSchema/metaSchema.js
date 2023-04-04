import { date, integer, object, string } from "./jsonSchemaTypes.js";

export function metaSchema() {
  return object(
    {
      created_on: date(),
      updated_on: date(),
      date_import: date(),
      inserjeunes: object({
        taux_poursuite_etudes: integer(),
        taux_emploi_24_mois: integer(),
        taux_emploi_18_mois: integer(),
        taux_emploi_12_mois: integer(),
        taux_emploi_6_mois: integer(),
        UAI: object({
          id_uai_etab: string(),
          libelle_etab: string(),
          adresse_etab_voie: string(),
          adresse_etab_localite: string(),
          adresse_etab_code_postal: string(),
        }),
      }),
    },
    { required: ["date_import", "created_on", "updated_on"] }
  );
}
