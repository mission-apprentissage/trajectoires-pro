import nock from "nock";
import { InserJeunesApi } from "#src/services/inserjeunes/InserJeunesApi.js";
import { generateCodeCertification } from "./testUtils.js";
import { CatalogueApprentissageApi } from "#src/services/catalogueApprentissage/CatalogueApprentissageApi.js";
import * as Fixtures from "#tests/utils/fixtures.js";
import { InserSupApi } from "#src/services/insersup/InsersupApi.js";

function createNock(baseUrl, options = {}) {
  let client = nock(baseUrl);
  return options.stack ? client : client.persist();
}

export function mockBCN(callback, options) {
  let client = createNock(`https://bcn.depp.education.fr/bcn/index.php/export`, options);
  callback(client);

  return client;
}

export async function mockCatalogueApprentissageApi(callback, options) {
  let client = createNock(CatalogueApprentissageApi.baseApiUrl, options);

  const formationCatalogue = await Fixtures.FormationsCatalogue();
  const etablissementsCatalogue = await Fixtures.EtablissementsCatalogue();
  const etablissementCatalogue = await Fixtures.EtablissementCatalogue();

  callback(client, {
    formations(custom = {}) {
      return Object.assign({}, formationCatalogue, custom);
    },
    etablissements(custom = {}) {
      return Object.assign({}, etablissementsCatalogue, custom);
    },
    etablissement(custom = {}) {
      return Object.assign({}, etablissementCatalogue, custom);
    },
  });

  return client;
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
      return JSON.stringify(
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
      );
    },
    certifications(custom = {}) {
      // L'API inserjeunes retourne un json dans un json
      return JSON.stringify(
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
      );
    },
    regionales(custom = {}) {
      return JSON.stringify(
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
                filiere: "apprentissage",
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
      );
    },
  });

  return client;
}

export function mockInsersupApi(response, options) {
  let client = createNock(InserSupApi.baseApiUrl, options);
  client
    .get(`/`)
    .query(() => true)
    .reply(200, response);
  return client;
}
