/**
 * Schema for the results of catalogue apprentissage API : etablissements
 */

import { object, objectId, string, date, boolean, integer } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema } from "./jsonSchema/metaSchema.js";

export const name = "caEtablissements";

export const fields = {
  _id: objectId(),
  siret: string(),
  siren: string(),
  nda: string(),
  naf_code: string(),
  naf_libelle: string(),
  date_creation: date(),
  date_mise_a_jour: date(),
  onisep_nom: string(),
  onisep_url: string(),
  onisep_code_postal: string(),
  adresse: string(),
  numero_voie: string(),
  type_voie: string(),
  nom_voie: string(),
  complement_adresse: string(),
  code_postal: string(),
  num_departement: string(),
  nom_departement: string(),
  localite: string(),
  code_insee_localite: string(),
  cedex: string(),
  date_fermeture: date(),
  region_implantation_code: string(),
  region_implantation_nom: string(),
  commune_implantation_code: string(),
  commune_implantation_nom: string(),
  pays_implantation_code: string(),
  pays_implantation_nom: string(),
  num_academie: integer(),
  nom_academie: string(),
  uai: string(),
  uai_valide: boolean(),
  rco_uai: string(),
  rco_adresse: string(),
  rco_code_postal: string(),
  rco_code_insee_localite: string(),
  geo_coordonnees: string(),
  rco_geo_coordonnees: string(),
  _meta: metaSchema(),
};

export function indexes() {
  return [[{ uai: 1 }, { unique: true }]];
}

export function schema() {
  return object(fields, {
    required: ["uai"],
    additionalProperties: false,
  });
}
