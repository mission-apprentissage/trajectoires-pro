import assert from "assert";
import { CatalogueApprentissageApi } from "#src/services/catalogueApprentissage/CatalogueApprentissageApi.js";
import { mockCatalogueApprentissageApi } from "#tests/utils/apiMocks.js";
import * as Fixtures from "#tests/utils/fixtures.js";

describe("CatalogueApprentissageApi", () => {
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

  describe("fetchEntities", () => {
    it("Transforme la query en JSON dans la requête", async () => {
      await mockCatalogueApprentissageApi(
        (client, responses) => {
          mockLogin(client, responses);
          client
            .get(`/entity/formations`)
            .query({ query: JSON.stringify({ cfd: "test" }), page: 1, limit: 100 })
            .reply(200, responses.formations());
        },
        { stack: true }
      );
      const api = new CatalogueApprentissageApi();
      const result = await api.fetchEntities("formations", { cfd: "test" });
      assert.deepEqual(result, await Fixtures.FormationsCatalogue());
    });

    it("Retourne la page demandée", async () => {
      await mockCatalogueApprentissageApi(
        (client, responses) => {
          mockLogin(client, responses);
          client
            .get(`/entity/formations`)
            .query({ query: "null", page: 2, limit: 5 })
            .reply(200, responses.formations());
        },
        { stack: true }
      );
      const api = new CatalogueApprentissageApi();
      const result = await api.fetchEntities("formations", null, { page: 2, limit: 5 });
      assert.deepEqual(result, await Fixtures.FormationsCatalogue());
    });
  });

  describe("fetchFormations", () => {
    it("Retourne une liste de formations", async () => {
      await mockCatalogueApprentissageApi(
        (client, responses) => {
          mockLogin(client, responses);
          client
            .get(`/entity/formations`)
            .query({ query: JSON.stringify({}), page: 1, limit: 100 })
            .reply(200, responses.formations());
        },
        { stack: true }
      );
      const api = new CatalogueApprentissageApi();
      const result = await api.fetchFormations({});
      assert.deepEqual(result, await Fixtures.FormationsCatalogue());
    });
  });

  describe("fetchEtablissements", () => {
    it("Retourne une liste d'établissements", async () => {
      await mockCatalogueApprentissageApi(
        (client, responses) => {
          mockLogin(client, responses);
          client
            .get(`/entity/etablissements`)
            .query({ query: JSON.stringify({}), page: 1, limit: 100 })
            .reply(200, responses.etablissements());
        },
        { stack: true }
      );
      const api = new CatalogueApprentissageApi();
      const result = await api.fetchEtablissements({});
      assert.deepEqual(result, await Fixtures.EtablissementsCatalogue());
    });
  });

  describe("fetchEtablissement", () => {
    it("Retourne un établissement", async () => {
      await mockCatalogueApprentissageApi(
        (client, responses) => {
          mockLogin(client, responses);
          client
            .get(`/entity/etablissement/5e8df88020ff3b2161267970`)
            .query(() => true)
            .reply(200, responses.etablissement());
        },
        { stack: true }
      );
      const api = new CatalogueApprentissageApi();
      const result = await api.fetchEtablissement("5e8df88020ff3b2161267970");
      assert.deepEqual(result, await Fixtures.EtablissementCatalogue());
    });
  });
});
