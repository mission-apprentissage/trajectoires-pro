import { integer } from "./jsonSchemaTypes.js";

export function statsSchema() {
  return {
    nb_annee_term: integer(),
    nb_en_emploi_24_mois: integer(),
    nb_en_emploi_18_mois: integer(),
    nb_en_emploi_12_mois: integer(),
    nb_en_emploi_6_mois: integer(),
    nb_poursuite_etudes: integer(),
    nb_sortant: integer(),
    taux_rupture_contrats: integer(),
    //Custom stats
    taux_en_formation: integer(),
    taux_en_emploi_24_mois: integer(),
    taux_en_emploi_18_mois: integer(),
    taux_en_emploi_12_mois: integer(),
    taux_en_emploi_6_mois: integer(),
  };
}
