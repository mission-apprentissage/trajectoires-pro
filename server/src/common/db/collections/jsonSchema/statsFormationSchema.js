import { integer } from "./jsonSchemaTypes.js";

export function valeursFormationStatsSchema() {
  return {
    nb_annee_term: integer(),
    nb_poursuite_etudes: integer(),
    nb_en_emploi_24_mois: integer(),
    nb_en_emploi_18_mois: integer(),
    nb_en_emploi_12_mois: integer(),
    nb_en_emploi_6_mois: integer(),
    nb_sortant: integer(),
  };
}

export function tauxFormationStatsSchema() {
  return {
    taux_poursuite_etudes: integer(),
    taux_emploi_24_mois: integer(),
    taux_emploi_18_mois: integer(),
    taux_emploi_12_mois: integer(),
    taux_emploi_6_mois: integer(),
  };
}
