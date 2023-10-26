/**
 * Schema for the etablissements list from ACCE (DEPP)
 */

import { object, objectId, string, date } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "acceEtablissements";

export const fields = {
  _id: objectId(),
  numero_uai: string(),
  nature_uai: string(),
  nature_uai_libe: string(),
  type_uai: string(),
  type_uai_libe: string(),
  etat_etablissement: string(),
  etat_etablissement_libe: string(),
  ministere_tutelle: string(),
  ministere_tutelle_libe: string(),
  tutelle_2: string(),
  tutelle_2_libe: string(),
  secteur_public_prive: string(),
  secteur_public_prive_libe: string(),
  sigle_uai: string(),
  categorie_juridique: string(),
  categorie_juridique_libe: string(),
  contrat_etablissement: string(),
  contrat_etablissement_libe: string(),
  categorie_financiere: string(),
  categorie_financiere_libe: string(),
  situation_comptable: string(),
  situation_comptable_libe: string(),
  niveau_uai: string(),
  niveau_uai_libe: string(),
  commune: string(),
  commune_libe: string(),
  academie: string(),
  academie_libe: string(),
  pays: string(),
  pays_libe: string(),
  departement_insee_3: string(),
  departement_insee_3_libe: string(),
  denomination_principale: string(),
  appellation_officielle: string(),
  patronyme_uai: string(),
  hebergement_etablissement: string(),
  hebergement_etablissement_libe: string(),
  numero_siren_siret_uai: string(),
  numero_finess_uai: string(),
  date_ouverture: date(),
  date_fermeture: date(),
  date_derniere_mise_a_jour: date(),
  lieu_dit_uai: string(),
  adresse_uai: string(),
  boite_postale_uai: string(),
  code_postal_uai: string(),
  etat_sirad_uai: string(),
  localite_acheminement_uai: string(),
  pays_etranger_acheminement: string(),
  numero_telephone_uai: string(),
  numero_telecopieur_uai: string(),
  mention_distribution: string(),
  mel_uai: string(),
  site_web: string(),
  coordonnee_x: string(),
  coordonnee_y: string(),
  appariement: string(),
  appariement_complement: string(),
  localisation: string(),
  localisation_complement: string(),
  date_geolocalisation: date(),
  source: string(),

  _meta: metaSchema([metaImportSchema()]),
};

export function indexes() {
  return [[{ numero_uai: 1 }, { unique: true }]];
}

export function schema() {
  return object(fields, {
    required: ["numero_uai", "_meta"],
    additionalProperties: false,
  });
}
