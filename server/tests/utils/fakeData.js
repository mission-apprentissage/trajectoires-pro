const { merge } = require("lodash");
const { dbCollection } = require("../../src/common/mongodb");

module.exports = {
  inserInserJeunesEtablissements(custom = {}) {
    return dbCollection("inserJeunesEtablissements").insertOne(
      merge(
        {},
        {
          millesime: "2022-2021",
          code_formation: "1022105",
          type: "apprentissage",
          diplome_renove_ou_nouveau: "non",
          duree_de_formation: 1,
          libelle_de_etablissement: "Centre de Formation",
          libelle_de_la_formation: "cuisinier en desserts de restaurant",
          region: {
            code: "84",
            nom: "Auvergne-Rhône-Alpes",
          },
          taux_de_poursuite_etudes: 42,
          taux_emploi_12_mois_apres_la_sortie: 58,
          taux_emploi_6_mois_apres_la_sortie: 60,
          type_de_diplome: "MC5",
          uai_de_etablissement: "0751234J",
        },
        custom
      )
    );
  },
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
        },
        custom
      )
    );
  },
};
