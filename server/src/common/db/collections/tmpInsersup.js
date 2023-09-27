import { object, objectId, string, number, integer, arrayOf } from "./jsonSchema/jsonSchemaTypes.js";

export const name = "tmpInsersup";

export function indexes() {
  return [[{ diplome: 1 }], [{ etablissement: 1 }], [{ libelle_diplome: 1 }], [{ annees_universitaire: 1 }]];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      diplome: string(),
      libelle_diplome: string(),
      type_diplome_long: string(),
      etablissement: string(),
      denomination_principale: string(),
      diplomes: integer(),
      sortants: integer(),
      poursuivants: integer(),
      taux_poursuivant: number(),
      in_dsn_6: integer(),
      in_dsn_12: integer(),
      in_dsn_18: integer(),
      in_dsn_24: integer(),
      in_dsn_30: integer(),
      taux_in_dsn_6: number(),
      taux_in_dsn_12: number(),
      taux_in_dsn_18: number(),
      taux_in_dsn_24: number(),
      taux_in_dsn_30: number(),
      annee_universitaire: string(),
      annees_universitaire: arrayOf(string()),
    },
    {
      additionalProperties: true,
    }
  );
}
