const { merge } = require("lodash");
const { dbCollection } = require("../../src/common/mongodb");

module.exports = {
  insertInserJeunesEtablissements(custom) {
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
  insertEtablissementsStats(custom) {
    return dbCollection("etablissementsStats").insertOne(
      merge(
        {},
        {
          uai: "0751234J",
          formations: [
            {
              code_formation: "12345678",
              millesime: "2018_2019",
              taux_emploi_12_mois: 12,
              taux_emploi_6_mois: 6,
            },
            {
              code_formation: "87456123",
              millesime: "2018_2019",
              taux_emploi_12_mois: 10,
              taux_emploi_6_mois: 20,
            },
          ],
        },
        custom
      )
    );
  },
};
