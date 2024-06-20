import { date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaImportSchema } from "./jsonSchema/metaSchema.js";

export const name = "bcn_sise";

export function indexes() {
  return [[{ diplome_sise: 1 }, { unique: true }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      diplome_sise: string(),
      type_diplome_sise: string(),
      voie_lmd: string(),
      domaine_formation: string(),
      libelle_intitule_1: string(),
      libelle_intitule_2: string(),
      groupe_specialite: string(),
      lettre_specialite: string(),
      secteur_disciplinaire_sise: string(),
      cite_domaine_formation: string(),
      duree: string(),
      nature_diplome_sise: string(),

      date_ouverture: date(),
      date_fermeture: date(),
      date_intervention: date(),

      definitif: string(),
      n_commentaire: string(),
      categorie_formation_sise: string(),
      cite_domaine_detaille: string(),
      secteur_discipl_detail_sise: string(),

      _meta: metaSchema([metaImportSchema()]),
    },
    {
      required: ["diplome_sise", "type_diplome_sise", "libelle_intitule_1", "_meta"],
      additionalProperties: true,
    }
  );
}
