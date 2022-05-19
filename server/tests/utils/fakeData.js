// eslint-disable-next-line node/no-unpublished-require
const { random, helpers } = require("@faker-js/faker").faker;
const { merge } = require("lodash");
const { dbCollection } = require("../../src/common/mongodb");
const { createUAI } = require("../../src/common/utils/validationUtils");

function randomStats() {
  return parseInt(random.numeric(2));
}

module.exports = {
  insertFormationsStats(custom = {}) {
    return dbCollection("formationsStats").insertOne(
      merge(
        {},
        {
          uai: createUAI(helpers.replaceSymbols("075####")),
          code_formation: helpers.replaceSymbols("########"),
          millesime: "2018_2019",
          filiere: "apprentissage",
          nb_annee_term: randomStats(),
          nb_en_emploi_12_mois: randomStats(),
          nb_en_emploi_6_mois: randomStats(),
          nb_poursuite_etudes: randomStats(),
          nb_sortant: randomStats(),
          taux_emploi_12_mois: randomStats(),
          taux_emploi_6_mois: randomStats(),
          taux_poursuite_etudes: randomStats(),
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
          code_formation: helpers.replaceSymbols("########"),
          filiere: "apprentissage",
          nb_annee_term: randomStats(),
          nb_poursuite_etudes: randomStats(),
          nb_en_emploi_12_mois: randomStats(),
          nb_en_emploi_6_mois: randomStats(),
          taux_poursuite_etudes: randomStats(),
          taux_emploi_12_mois: randomStats(),
          taux_emploi_6_mois: randomStats(),
          taux_rupture_contrats: randomStats(),
        },
        custom
      )
    );
  },
};
