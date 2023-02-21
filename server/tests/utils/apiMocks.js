import nock from "nock"; // eslint-disable-line node/no-unpublished-import
import { InserJeunesApi } from "../../src/common/inserjeunes/InserJeunesApi.js";
import { generateCodeCertification } from "./testUtils.js";

function createNock(baseUrl, options = {}) {
  let client = nock(baseUrl);
  return options.stack ? client : client.persist();
}

export function mockInserJeunesApi(callback, options) {
  let client = createNock(InserJeunesApi.baseApiUrl, options);
  callback(client, {
    login(custom = {}) {
      return Object.assign(
        {},
        {
          access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9",
        },
        custom
      );
    },
    uai(custom = {}) {
      // L'API inserjeunes retourne un json dans un json
      return JSON.stringify(
        JSON.stringify(
          Object.assign(
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
                      id_formation_apprentissage: generateCodeCertification(),
                    },
                  ],
                },
              ],
            },
            custom
          )
        )
      );
    },
    certifications(custom = {}) {
      // L'API inserjeunes retourne un json dans un json
      return JSON.stringify(
        JSON.stringify(
          Object.assign(
            {},
            {
              metadata: {
                liste_mesures: [
                  {
                    id_mesure: "taux_emploi_6_mois",
                    libelle_mesure: "Taux d emploi salarié en France à 6 mois",
                    unite: "pourcentage",
                  },
                  {
                    id_mesure: "taux_poursuite_etudes",
                    libelle_mesure: "Taux de poursuite d études",
                    unite: "pourcentage",
                  },
                ],
                liste_dimensions: [
                  {
                    id_moda_dim: 947,
                    id_moda_dim_parent: 39,
                    id_dimension: "id_formation_apprentissage",
                    libelle_dimension: "spécialité de formation (apprentissage)",
                    id_modalite: "56033104",
                    libelle_modalite: "ambulancier",
                  },
                ],
              },
              data: [
                {
                  id_mesure: "taux_emploi_6_mois",
                  valeur_mesure: 6,
                  dimensions: [
                    {
                      id_formation_apprentissage: generateCodeCertification(),
                    },
                  ],
                },
              ],
            },
            custom
          )
        )
      );
    },
  });

  return client;
}
