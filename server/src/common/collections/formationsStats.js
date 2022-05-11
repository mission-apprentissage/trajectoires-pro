const { object, objectId, string, integer, date } = require("./schemas/jsonSchemaTypes");
module.exports = {
  name: "formationsStats",
  schema: () => {
    return object(
      {
        _id: objectId(),
        uai: string(),
        millesime: string(),
        code_formation: string(),
        filiere: string({ enum: ["apprentissage", "pro"] }),
        nb_annee_term: integer(),
        nb_poursuite_etudes: integer(),
        nb_en_emploi_12_mois: integer(),
        nb_en_emploi_6_mois: integer(),
        nb_sortant: integer(),
        taux_poursuite_etudes: integer(),
        taux_emploi_12_mois: integer(),
        taux_emploi_6_mois: integer(),
        _meta: object(
          {
            date_import: date(),
          },
          { required: ["date_import"] }
        ),
      },
      { additionalProperties: false }
    );
  },
  indexes: () => {
    return [
      [{ uai: 1, code_formation: 1, millesime: 1 }, { unique: true }],
      [{ uai: 1 }],
      [{ millesime: 1 }],
      [{ code_formation: 1 }],
      [{ filiere: 1 }],
    ];
  },
};
