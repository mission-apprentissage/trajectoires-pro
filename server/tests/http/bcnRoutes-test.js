import * as chai from "chai";
import chaiDiff from "chai-diff";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import MockDate from "mockdate";
import config from "#src/config.js";
import { startServer } from "#tests/utils/testUtils.js";
import { insertCFD, insertMEF } from "#tests/utils/fakeData.js";

chai.use(deepEqualInAnyOrder);
chai.use(chaiDiff);
const { assert } = chai;

describe("bcnRoutes", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("Recherche", () => {
    function getAuthHeaders() {
      return {
        "x-api-key": config.inserJeunes.api.key,
      };
    }

    it("Vérifie qu'on peut obtenir la liste des formations", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
      await insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345679" });

      const response = await httpClient.get(`/api/inserjeunes/bcn`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        bcn: [
          {
            type: "cfd",
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            libelle: "BAC PRO BATIMENT",
            libelle_long: "BAC PRO BATIMENT",
            diplome: { code: "4", libelle: "BAC" },
            date_ouverture: "2023-01-01T00:00:00.000Z",
            nouveau_diplome: [],
            ancien_diplome: [],
          },
          {
            type: "mef",
            code_certification: "23830024202",
            code_formation_diplome: "12345679",
            date_fermeture: "2022-08-30T22:00:00.000Z",
            diplome: { code: "4", libelle: "BAC" },
            libelle: "BAC PRO",
            libelle_long: "BAC PRO BATIMENT",
            date_ouverture: "2023-01-01T00:00:00.000Z",
            nouveau_diplome: [],
            ancien_diplome: [],
          },
        ],
        pagination: {
          nombre_de_page: 1,
          page: 1,
          items_par_page: 10,
          total: 2,
        },
      });
    });

    it("Vérifie qu'on peut limiter le nombre de résultats", async () => {
      const { httpClient } = await startServer();
      await insertCFD();
      await insertCFD();

      const response = await httpClient.get(`/api/inserjeunes/bcn?items_par_page=1`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.bcn.length, 1);
    });

    it("Vérifie qu'on peut paginer les résultats", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
      await insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345679" });

      const response = await httpClient.get(`/api/inserjeunes/bcn?items_par_page=1&page=2`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.bcn.length, 1);
      assert.strictEqual(response.data.bcn[0].code_certification, "23830024202");
    });

    it("Vérifie qu'on peut exporter les données au format CSV", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });

      const response = await httpClient.get(`/api/inserjeunes/bcn.csv`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
      assert.deepStrictEqual(
        response.data,
        `code_certification;type;code_formation_diplome;libelle;libelle_long;diplome_libelle;date_ouverture;date_fermerture;date_premiere_session;date_derniere_session
12345678;cfd;12345678;BAC PRO BATIMENT;BAC PRO BATIMENT;BAC;2023-01-01T01:00:00+01:00;;;
`
      );
    });

    it("Vérifie qu'on retourne une 404 si les paramètres sont invalides", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/bcn?invalid=true`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 400);
      assert.deepStrictEqual(response.data, {
        details: [
          {
            context: {
              child: "invalid",
              key: "invalid",
              label: "invalid",
              value: "true",
            },
            message: '"invalid" is not allowed',
            path: ["invalid"],
            type: "object.unknown",
          },
        ],
        error: "Bad Request",
        message: "Erreur de validation",
        statusCode: 400,
      });
    });

    it("Vérifie qu'on retourne une 401 sans apiKey", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/bcn`);

      assert.strictEqual(response.status, 401);
    });

    it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/bcn?apiKey=${config.inserJeunes.api.key}`);

      assert.strictEqual(response.status, 200);
    });
  });
});
