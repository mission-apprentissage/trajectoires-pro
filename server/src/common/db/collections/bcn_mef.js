import { date, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { metaSchema, metaBCNSchema } from "./jsonSchema/metaSchema.js";

export const name = "bcn_mef";

export function indexes() {
  return [[{ mef_stat_11: 1 }, { unique: true }], [{ mef: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      mef_stat_11: string(),
      mef: string(),
      dispositif_formation: string(),
      formation_diplome: string(),
      duree_dispositif: string(),
      annee_dispositif: string(),

      libelle_court: string(),
      libelle_long: string(),

      date_ouverture: date(),
      date_fermeture: date(),

      statut_mef: string(),
      nb_option_obligatoire: string(),
      nb_option_facultatif: string(),
      renforcement_langue: string(),
      duree_projet: string(),
      duree_stage: string(),
      horaire: string(),
      mef_inscription_scolarite: string(),
      mef_stat_9: string(),

      date_intervention: date(),
      libelle_edition: string(),
      commentaire: string(),

      _meta: metaSchema([metaBCNSchema()]),
    },
    {
      required: [
        "mef",
        "dispositif_formation",
        "formation_diplome",
        "duree_dispositif",
        "annee_dispositif",
        "mef_stat_11",
        "libelle_court",
        "libelle_long",
        "_meta",
      ],
      additionalProperties: true,
    }
  );
}
