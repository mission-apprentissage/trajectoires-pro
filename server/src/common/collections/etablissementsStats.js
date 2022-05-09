const { object, objectId, string, integer } = require("./schemas/jsonSchemaTypes");
module.exports = {
  name: "etablissementsStats",
  schema: () => {
    return object(
      {
        _id: objectId(),
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
    return [[{ uai: 1 }, { unique: true }], [{ "formations.millesime": 1 }], [{ "formations.code_formation": 1 }]];
  },
};
