const nock = require("nock"); // eslint-disable-line node/no-unpublished-require
const InsertJeunesApi = require("../../src/common/api/InsertJeunesApi");
const { merge } = require("lodash");

function createNock(baseUrl, options = {}) {
  let client = nock(baseUrl);
  return options.stack ? client : client.persist();
}

module.exports = {
  mockInsertJeunesApi(callback, options) {
    let client = createNock(InsertJeunesApi.baseApiUrl, options);
    callback(client, {
      login(custom = {}) {
        return merge(
          {},
          {
            access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
          },
          custom
        );
      },
      uai(custom = {}) {
        return merge(
          {},
          {
            metadata: {
              liste_mesures: [
                {
                  id_mesure: "taux_emploi_12_mois",
                  libelle_mesure: "Taux d emploi salarié en France à 12 mois",
                  unite: "pourcentage",
                },
                {
                  id_mesure: "taux_emploi_6_mois",
                  libelle_mesure: "Taux d emploi salarié en France à 6 mois",
                  unite: "pourcentage",
                },
              ],
              liste_dimensions: [
                {
                  id_moda_dim: 1,
                  id_moda_dim_parent: null,
                  id_dimension: "id_formation_apprentissage",
                  libelle_dimension: "spécialité de formation (apprentissage)",
                  id_modalite: "35011402",
                  libelle_modalite: "statistique et informatique decisionnelle",
                },
              ],
              UAI: {
                id_uai_etab: "0751234J",
                libelle_etab: "Centre de formation",
                adresse_etab_voie: "31 rue des lilas",
                adresse_etab_localite: "Paris",
                adresse_etab_code_postal: "75019",
              },
            },
            data: [
              {
                id_mesure: "taux_emploi_6_mois",
                valeur_mesure: 6,
                dimensions: [
                  {
                    id_formation_apprentissage: "12345678",
                  },
                ],
              },
              {
                id_mesure: "taux_emploi_12_mois",
                valeur_mesure: 12,
                dimensions: [
                  {
                    id_formation_apprentissage: "12345678",
                  },
                ],
              },
              {
                id_mesure: "taux_emploi_6_mois",
                valeur_mesure: 20,
                dimensions: [
                  {
                    id_formation_apprentissage: "87456123",
                  },
                ],
              },
              {
                id_mesure: "taux_emploi_12_mois",
                valeur_mesure: 10,
                dimensions: [
                  {
                    id_formation_apprentissage: "87456123",
                  },
                ],
              },
            ],
          },
          custom
        );
      },
    });

    return client;
  },
};
