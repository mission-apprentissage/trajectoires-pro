import { date, integer, object, objectId, string } from "./jsonSchema/jsonSchemaTypes.js";
import { diplomeSchema } from "./jsonSchema/diplomeSchema.js";

export const name = "formationsStats";

export function indexes() {
  return [
    [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    [{ uai: 1 }],
    [{ millesime: 1 }],
    [{ code_certification: 1 }],
    [{ filiere: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      millesime: string(),
      code_certification: string(),
      code_formation_diplome: string(),
      filiere: string({ enum: ["apprentissage", "pro"] }),
      nb_annee_term: integer(),
      nb_poursuite_etudes: integer(),
      nb_en_emploi_24_mois: integer(),
      nb_en_emploi_18_mois: integer(),
      nb_en_emploi_12_mois: integer(),
      nb_en_emploi_6_mois: integer(),
      nb_sortant: integer(),
      taux_poursuite_etudes: integer(),
      taux_emploi_24_mois: integer(),
      taux_emploi_18_mois: integer(),
      taux_emploi_12_mois: integer(),
      taux_emploi_6_mois: integer(),
      diplome: diplomeSchema(),
      _meta: object(
        {
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: ["uai", "millesime", "code_certification", "code_formation_diplome", "filiere", "diplome"],
      additionalProperties: false,
    }
  );
}
