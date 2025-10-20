import * as chai from "chai";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import { ObjectId } from "mongodb";
import { importFormations } from "#src/jobs/catalogueApprentissage/importFormations.js";
import { mockCatalogueApprentissageApi } from "#tests/utils/apiMocks.js";
import CAFormationRepository from "#src/common/repositories/CAFormation.js";
import streamToArray from "stream-to-array";
import deepEqualInAnyOrder from "deep-equal-in-any-order";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("importFormations", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  function mockLogin(client) {
    client
      .post("/auth/login")
      .query(() => true)
      .reply(
        200,
        {},
        {
          "set-cookie": "connect.sid=SID;",
        }
      );
  }

  it("Vérifie qu'on peut importer les formations du catalogue", async () => {
    await mockCatalogueApprentissageApi(
      (client, responses) => {
        mockLogin(client, responses);
        client
          .get(`/entity/formations`)
          .query({
            query: JSON.stringify({
              $or: [{ published: true }, { catalogue_published: true }],
              cfd: { $ne: null },
            }),
            page: 1,
            limit: 1,
          })
          .reply(200, responses.formations());

        client
          .get(`/entity/formations`)
          .query({
            query: JSON.stringify({
              $or: [{ published: true }, { catalogue_published: true }],
              cfd: { $ne: null },
            }),
            page: 1,
            limit: 100,
          })
          .reply(200, responses.formations());
      },
      { stack: true }
    );
    let stats = await importFormations();

    const found = await streamToArray(await CAFormationRepository.find({}));
    assert.deepEqualInAnyOrder(
      found.map((f) => omit(f, "_id")),
      [
        {
          id: new ObjectId("5fc616c5712d48a988133fa7"),
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          bcn_mefs_10: [],
          cfd: "46X25201",
          cfd_date_fermeture: new Date("2027-08-31T00:00:00.000Z"),
          cfd_outdated: false,
          code_commune_insee: "33063",
          code_postal: "33300",
          diplome: "TH DE NIV 4 ORGANISMES GESTIONNAIRES DIVERS",
          etablissement_formateur_enseigne: "INSTITUT METIERS ARTISANAT 33",
          etablissement_formateur_entreprise_raison_sociale:
            "CHAMBRE DE METIERS ET DE L'ARTISANAT DE REGION NOUVELLE AQUITAINE",
          etablissement_formateur_id: new ObjectId("60403399d5e868001c9347b6"),
          etablissement_formateur_siren: "130027923",
          etablissement_formateur_siret: "13002792300171",
          etablissement_formateur_uai: "0331707B",
          etablissement_gestionnaire_enseigne: "CMA DE LA GIRONDE",
          etablissement_gestionnaire_entreprise_raison_sociale:
            "CHAMBRE DE METIERS ET DE L'ARTISANAT DE REGION NOUVELLE AQUITAINE",
          etablissement_gestionnaire_id: new ObjectId("60403396d5e868001c9347ae"),
          etablissement_gestionnaire_siren: "130027923",
          etablissement_gestionnaire_siret: "13002792300163",
          etablissement_reference: "gestionnaire",
          intitule_court: "CONSEILLER TECH CYCLES",
          intitule_long: "CONSEILLER TECHNIQUE CYCLES (ANFA)",
          libelle_court: "TH4-X",
          localite: "Bordeaux",
          niveau: "4 (BAC...)",
          nom_academie: "Bordeaux",
          nom_departement: "Gironde",
          num_academie: "4",
          num_departement: "33",
          region: "Nouvelle-Aquitaine",
          uai_formation: "0331707B",
        },
        {
          id: new ObjectId("5fc61896712d48a988137bf9"),
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          bcn_mefs_10: [
            { mef10: "3112310721", modalite: { duree: "2", annee: "1" } },
            { mef10: "3112310722", modalite: { duree: "2", annee: "2" } },
          ],
          cfd: "32023107",
          cfd_date_fermeture: new Date("2024-08-31T00:00:00.000Z"),
          cfd_outdated: false,
          code_commune_insee: "47065",
          code_postal: "47320",
          diplome: "BREVET DE TECHNICIEN SUPERIEUR",
          etablissement_formateur_enseigne: "",
          etablissement_formateur_entreprise_raison_sociale:
            "LYCEE PROFESSIONNEL PORTE DU LOT - LYCEE DES METIERS DE LA MAINTENANCE ET DES TRAVAUX PUBLICS",
          etablissement_formateur_id: new ObjectId("5e8df8cb20ff3b2161267ff2"),
          etablissement_formateur_siren: "194700159",
          etablissement_formateur_siret: "19470015900016",
          etablissement_formateur_uai: "0470015L",
          etablissement_gestionnaire_enseigne: "",
          etablissement_gestionnaire_entreprise_raison_sociale:
            "LYCEE PROFESSIONNEL PORTE DU LOT - LYCEE DES METIERS DE LA MAINTENANCE ET DES TRAVAUX PUBLICS",
          etablissement_gestionnaire_id: new ObjectId("5e8df8cb20ff3b2161267ff2"),
          etablissement_gestionnaire_siren: "194700159",
          etablissement_gestionnaire_siret: "19470015900016",
          etablissement_gestionnaire_uai: "0470015L",
          etablissement_reference: "gestionnaire",
          intitule_court: "TRAVAUX PUBLICS",
          intitule_long: "TRAVAUX PUBLICS (BTS)",
          libelle_court: "BTS",
          localite: "Clairac",
          niveau: "5 (BTS, DEUST...)",
          nom_academie: "Bordeaux",
          nom_departement: "Lot-et-Garonne",
          num_academie: "4",
          num_departement: "47",
          region: "Nouvelle-Aquitaine",
          uai_formation: "0470015L",
        },
      ]
    );
    assert.deepStrictEqual(stats, {
      created: 2,
      failed: 0,
      updated: 0,
      total: 2,
    });
  });
});
