const { merge } = require("lodash");
const { dbCollection } = require("../../src/common/mongodb");

module.exports = {
  insertFormationsStats(custom = {}) {
    return dbCollection("formationsStats").insertOne(
      merge(
        {},
        {
          uai: "0751234J",
          code_formation: "12345678",
          millesime: "2018_2019",
          filiere: "apprentissage",
          nb_annee_term: 46,
          nb_en_emploi_12_mois: 12,
          nb_en_emploi_6_mois: 10,
          nb_poursuite_etudes: 14,
          nb_sortant: 32,
          taux_emploi_12_mois: 38,
          taux_emploi_6_mois: 31,
          taux_poursuite_etudes: 30,
          _meta: {
            date_import: new Date(),
          },
        },
        custom
      )
    );
  },
  insertCertificationsStats(custom = {}) {
    return dbCollection("certificationsStats").insertOne(
      merge(
        {},
        {
          millesime: "2020",
          code_formation: "12345",
          filiere: "apprentissage",
          taux_emploi_6_mois: 31,
        },
        custom
      )
    );
  },
};
