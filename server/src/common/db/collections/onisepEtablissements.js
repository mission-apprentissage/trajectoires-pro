import { object, objectId, string, number } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "onisepEtablissements";

export function indexes() {
  return [[{ code_uai: 1 }, { unique: true }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      code_uai: string(),
      n_siret: string(),
      type_detablissement: string(),
      nom: string(),
      sigle: string(),
      statut: string(),
      tutelle: string(),
      universite_de_rattachement_libelle: string(),
      universite_de_rattachement_id_et_url_onisep: string(),
      etablissements_lies_libelles: string(),
      etablissements_lies_url_et_id_onisep: string(),
      boite_postale: string(),
      adresse: string(),
      cp: string(),
      commune: string(),
      commune_cog: string(),
      cedex: string(),
      telephone: string(),
      arrondissement: string(),
      departement: string(),
      academie: string(),
      region: string(),
      region_cog: string(),
      longitude_x: number(),
      latitude_y: number(),
      journees_portes_ouvertes: string(),
      langues_enseignees: string(),
      label_generation_2024: string(),
      url_et_id_onisep: string(),
      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["code_uai", "_meta"],
      additionalProperties: false,
    }
  );
}
