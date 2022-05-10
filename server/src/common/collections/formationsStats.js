const { object, objectId, string, integer } = require("./schemas/jsonSchemaTypes");
module.exports = {
  name: "formationsStats",
  schema: () => {
    return object(
      {
        _id: objectId(),
        uai: string(),
        code_formation: string(),
        millesime: string(),
        type: string({ enum: ["apprentissage", "pro"] }),
        nb_annee_term: integer(),
        nb_en_emploi_12_mois: integer(),
        nb_en_emploi_6_mois: integer(),
        nb_poursuite_etudes: integer(),
        nb_sortant: integer(),
        taux_emploi_12_mois: integer(),
        taux_emploi_6_mois: integer(),
        taux_poursuite_etudes: integer(),
      },
      { additionalProperties: true }
    );
  },
  indexes: () => {
    return [[{ uai: 1, code_formation: 1 }, { unique: true }], [{ millesime: 1 }], [{ code_formation: 1 }]];
  },
};
