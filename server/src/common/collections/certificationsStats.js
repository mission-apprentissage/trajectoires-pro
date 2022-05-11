const { object, objectId, string, date, integer } = require("./schemas/jsonSchemaTypes");
module.exports = {
  name: "certificationsStats",
  schema: () => {
    return object(
      {
        _id: objectId(),
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
        taux_rupture_contrats: integer(),
        _meta: object(
          {
            date_import: date(),
          },
          { required: ["date_import"] }
        ),
      },
      { additionalProperties: true }
    );
  },
  indexes: () => {
    return [
      [{ millesime: 1, code_formation: 1 }, { unique: true }],
      [{ millesime: 1 }],
      [{ filiere: 1 }],
      [{ code_formation: 1 }],
    ];
  },
};
