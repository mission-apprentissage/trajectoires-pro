import assert from "assert";
import config from "../../src/config.js";
import { startServer } from "../utils/testUtils.js";
import { insertCFD, insertMEF, insertRegionalesStats } from "../utils/fakeData.js";
import { dbCollection } from "../../src/common/db/mongodb.js";

describe("regionalesRoutes", () => {
  describe("Recherche", () => {
    function getAuthHeaders() {
      return {
        "x-api-key": config.inserJeunes.api.key,
      };
    }

    it("Vérifie qu'on peut obtenir les stats pour toutes les régions", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2020",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        nb_annee_term: 100,
        nb_poursuite_etudes: 1,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_18_mois: 3,
        nb_en_emploi_12_mois: 4,
        nb_en_emploi_6_mois: 5,
        nb_sortant: 6,
        taux_rupture_contrats: 7,
        taux_en_formation: 8,
        taux_en_emploi_24_mois: 9,
        taux_en_emploi_18_mois: 10,
        taux_en_emploi_12_mois: 11,
        taux_en_emploi_6_mois: 12,
        taux_autres_6_mois: 13,
        taux_autres_12_mois: 14,
        taux_autres_18_mois: 15,
        taux_autres_24_mois: 16,
      });

      const response = await httpClient.get(`/api/inserjeunes/regionales`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        regionales: [
          {
            region: { code: "11", nom: "Île-de-France" },
            millesime: "2020",
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            diplome: { code: "4", libelle: "BAC" },
            nb_annee_term: 100,
            nb_poursuite_etudes: 1,
            nb_en_emploi_24_mois: 2,
            nb_en_emploi_18_mois: 3,
            nb_en_emploi_12_mois: 4,
            nb_en_emploi_6_mois: 5,
            nb_sortant: 6,
            taux_rupture_contrats: 7,
            taux_en_formation: 8,
            taux_en_emploi_24_mois: 9,
            taux_en_emploi_18_mois: 10,
            taux_en_emploi_12_mois: 11,
            taux_en_emploi_6_mois: 12,
            taux_autres_6_mois: 13,
            taux_autres_12_mois: 14,
            taux_autres_18_mois: 15,
            taux_autres_24_mois: 16,
          },
        ],
        pagination: {
          nombre_de_page: 1,
          page: 1,
          items_par_page: 10,
          total: 1,
        },
      });
    });

    it("Vérifie qu'on peut limiter le nombre de résultats", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats();
      await insertRegionalesStats();

      const response = await httpClient.get(`/api/inserjeunes/regionales?items_par_page=1`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.regionales.length, 1);
    });

    it("Vérifie qu'on peut paginer les résultats", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ filiere: "apprentissage" });
      await insertRegionalesStats({ filiere: "pro" });

      const response = await httpClient.get(`/api/inserjeunes/regionales?items_par_page=1&page=2`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.regionales.length, 1);
      assert.strictEqual(response.data.regionales[0].filiere, "pro");
    });

    it("Vérifie qu'on peut obtenir les stats régionales pour un millesime", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ millesime: "2018" });
      await insertRegionalesStats({ millesime: "2020" });

      const response = await httpClient.get(`/api/inserjeunes/regionales?millesimes=2018`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.regionales[0].millesime, "2018");
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour code formation", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345" });
      await insertRegionalesStats({ code_certification: "67890" });

      const response = await httpClient.get(`/api/inserjeunes/regionales?code_certifications=12345`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.regionales[0].code_certification, "12345");
    });

    it("Vérifie qu'on peut exporter les données au format CSV", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2020",
        code_certification: "12345678",
        filiere: "apprentissage",
        nb_annee_term: 100,
        nb_poursuite_etudes: 1,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_18_mois: 3,
        nb_en_emploi_12_mois: 4,
        nb_en_emploi_6_mois: 5,
        nb_sortant: 6,
        taux_rupture_contrats: 7,
        taux_en_formation: 8,
        taux_en_emploi_24_mois: 9,
        taux_en_emploi_18_mois: 10,
        taux_en_emploi_12_mois: 11,
        taux_en_emploi_6_mois: 12,
        taux_autres_6_mois: 13,
        taux_autres_12_mois: 14,
        taux_autres_18_mois: 15,
        taux_autres_24_mois: 16,
      });

      const response = await httpClient.get(`/api/inserjeunes/regionales.csv`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
      assert.deepStrictEqual(
        response.data,
        `region;code_certification;filiere;millesime;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_18_mois;nb_en_emploi_24_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_autres_12_mois;taux_autres_18_mois;taux_autres_24_mois;taux_autres_6_mois;taux_en_emploi_12_mois;taux_en_emploi_18_mois;taux_en_emploi_24_mois;taux_en_emploi_6_mois;taux_en_formation;taux_rupture_contrats
Île-de-France;12345678;apprentissage;2020;100;4;3;2;5;1;6;14;15;16;13;11;10;9;12;8;7
`
      );
    });

    it("Vérifie qu'on retourne une 404 si les paramètres sont invalides", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/regionales?invalid=true`, {
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

      const response = await httpClient.get(`/api/inserjeunes/regionales`);

      assert.strictEqual(response.status, 401);
    });

    it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/regionales?apiKey=${config.inserJeunes.api.key}`);

      assert.strictEqual(response.status, 200);
    });
  });

  describe("Region", () => {
    function getAuthHeaders() {
      return {
        "x-api-key": config.inserJeunes.api.key,
      };
    }

    it("Vérifie qu'on peut obtenir les stats pour une région", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2020",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        nb_annee_term: 100,
        nb_poursuite_etudes: 1,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_18_mois: 3,
        nb_en_emploi_12_mois: 4,
        nb_en_emploi_6_mois: 5,
        nb_sortant: 6,
        taux_rupture_contrats: 7,
        taux_en_formation: 8,
        taux_en_emploi_24_mois: 9,
        taux_en_emploi_18_mois: 10,
        taux_en_emploi_12_mois: 11,
        taux_en_emploi_6_mois: 12,
        taux_autres_6_mois: 13,
        taux_autres_12_mois: 14,
        taux_autres_18_mois: 15,
        taux_autres_24_mois: 16,
      });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        regionales: [
          {
            region: { code: "11", nom: "Île-de-France" },
            millesime: "2020",
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            diplome: { code: "4", libelle: "BAC" },
            nb_annee_term: 100,
            nb_poursuite_etudes: 1,
            nb_en_emploi_24_mois: 2,
            nb_en_emploi_18_mois: 3,
            nb_en_emploi_12_mois: 4,
            nb_en_emploi_6_mois: 5,
            nb_sortant: 6,
            taux_rupture_contrats: 7,
            taux_en_formation: 8,
            taux_en_emploi_24_mois: 9,
            taux_en_emploi_18_mois: 10,
            taux_en_emploi_12_mois: 11,
            taux_en_emploi_6_mois: 12,
            taux_autres_6_mois: 13,
            taux_autres_12_mois: 14,
            taux_autres_18_mois: 15,
            taux_autres_24_mois: 16,
          },
        ],
        pagination: {
          nombre_de_page: 1,
          page: 1,
          items_par_page: 10,
          total: 1,
        },
      });
    });
  });

  describe("Obtention", () => {
    it("Vérifie qu'on peut obtenir la stats la plus récente", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2020",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        nb_annee_term: 100,
        nb_poursuite_etudes: 1,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_18_mois: 3,
        nb_en_emploi_12_mois: 4,
        nb_en_emploi_6_mois: 5,
        nb_sortant: 6,
        taux_rupture_contrats: 7,
        taux_en_formation: 8,
        taux_en_emploi_24_mois: 9,
        taux_en_emploi_18_mois: 10,
        taux_en_emploi_12_mois: 11,
        taux_en_emploi_6_mois: 12,
        taux_autres_6_mois: 13,
        taux_autres_12_mois: 14,
        taux_autres_18_mois: 15,
        taux_autres_24_mois: 16,
      });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2019" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        millesime: "2020",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        diplome: { code: "4", libelle: "BAC" },
        nb_annee_term: 100,
        nb_poursuite_etudes: 1,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_18_mois: 3,
        nb_en_emploi_12_mois: 4,
        nb_en_emploi_6_mois: 5,
        nb_sortant: 6,
        taux_rupture_contrats: 7,
        taux_en_formation: 8,
        taux_en_emploi_24_mois: 9,
        taux_en_emploi_18_mois: 10,
        taux_en_emploi_12_mois: 11,
        taux_en_emploi_6_mois: 12,
        taux_autres_6_mois: 13,
        taux_autres_12_mois: 14,
        taux_autres_18_mois: 15,
        taux_autres_24_mois: 16,
        region: { code: "11", nom: "Île-de-France" },
        _meta: {
          titre: "Certification 12345678",
          details:
            "Données InserJeunes pour la certification 12345678 (BAC filière apprentissage) pour le millesime 2020",
        },
      });
    });

    it("Vérifie qu'on peut obtenir une certification pour un millesime", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2018" });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2019" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678?millesime=2018`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2018");
    });

    it("Vérifie qu'on peut obtenir les stats avec une vue", async () => {
      const { httpClient } = await startServer();
      await Promise.all([
        insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" }),
        insertRegionalesStats({
          region: { code: "11", nom: "Île-de-France" },
          code_certification: "12345678",
          code_formation_diplome: "12345678",
          filiere: "apprentissage",
          millesime: "2020",
          nb_sortant: 100,
          nb_annee_term: 100,
          nb_poursuite_etudes: 5,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_6_mois: 50,
        }),
        insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" }),
        insertRegionalesStats({
          region: { code: "11", nom: "Île-de-France" },
          code_certification: "23830024202",
          code_formation_diplome: "12345678",
          filiere: "pro",
          millesime: "2020",
          nb_sortant: 100,
          nb_annee_term: 100,
          nb_poursuite_etudes: 5,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_6_mois: 50,
        }),
      ]);

      const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/12345678?vue=filieres");

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        apprentissage: {
          codes_certifications: ["12345678"],
          code_formation_diplome: "12345678",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          filiere: "apprentissage",
          millesime: "2020",
          nb_sortant: 100,
          nb_annee_term: 100,
          nb_poursuite_etudes: 5,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_6_mois: 50,
          //computed
          taux_en_formation: 5,
          taux_en_emploi_24_mois: 25,
          taux_en_emploi_18_mois: 25,
          taux_en_emploi_12_mois: 25,
          taux_en_emploi_6_mois: 50,
          taux_autres_6_mois: 45,
          taux_autres_12_mois: 70,
          taux_autres_18_mois: 70,
          taux_autres_24_mois: 70,
        },
        pro: {
          codes_certifications: ["23830024202"],
          code_formation_diplome: "12345678",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          filiere: "pro",
          millesime: "2020",
          nb_sortant: 100,
          nb_annee_term: 100,
          nb_poursuite_etudes: 5,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_6_mois: 50,
          //computed
          taux_en_formation: 5,
          taux_en_emploi_24_mois: 25,
          taux_en_emploi_18_mois: 25,
          taux_en_emploi_12_mois: 25,
          taux_en_emploi_6_mois: 50,
          taux_autres_6_mois: 45,
          taux_autres_12_mois: 70,
          taux_autres_18_mois: 70,
          taux_autres_24_mois: 70,
        },
      });
    });

    it("Vérifie qu'on retourne une 404 si la certification est inconnue", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/INCONNUE`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Pas de données disponibles",
        statusCode: 404,
      });
    });
  });

  describe("Widget", () => {
    it("Vérifie qu'on peut obtenir une image SVG", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "23830024203",
        filiere: "apprentissage",
        taux_en_formation: 5,
      });

      const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/23830024203.svg");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes("5%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
      assert.ok(response.data.includes("<title>Certification 23830024203</title>"));
      assert.ok(
        response.data.includes(
          "<desc>Données InserJeunes pour la certification 23830024203 (BAC filière apprentissage) pour le millesime 2018_2019</desc>"
        )
      );
    });

    it("Vérifie qu'on peut obtenir le widget avec une vue CFD", async () => {
      const { httpClient } = await startServer();
      await Promise.all([
        insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" }),
        insertRegionalesStats({
          region: { code: "11", nom: "Île-de-France" },
          code_certification: "12345678",
          code_formation_diplome: "12345678",
          filiere: "apprentissage",
          millesime: "2020",
          nb_sortant: 100,
          nb_annee_term: 50,
          nb_poursuite_etudes: 5,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_6_mois: 50,
        }),
        insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" }),
        insertRegionalesStats({
          region: { code: "11", nom: "Île-de-France" },
          code_certification: "23830024202",
          code_formation_diplome: "12345678",
          filiere: "pro",
          millesime: "2020",
          nb_sortant: 100,
          nb_annee_term: 50,
          nb_poursuite_etudes: 5,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_6_mois: 50,
        }),
      ]);

      const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/12345678.svg?vue=filieres");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes("100%"));
      assert.ok(response.data.includes("10%"));
      assert.ok(response.data.includes("Apprentissage"));
      assert.ok(response.data.includes("Voie scolaire"));
    });

    it("Vérifie qu'on obtient une erreur quand la statistique n'existe pas", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/INCONNUE.svg");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.message, "Pas de données disponibles");
    });

    it("Vérifie qu'on obtient une erreur quand il n'y a pas de données disponible pour la stats", async () => {
      const { httpClient } = await startServer();
      await dbCollection("regionalesStats").insertOne({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "23830024203",
        code_formation_diplome: "12345678",
        millesime: "2018",
        filiere: "apprentissage",
        diplome: { code: "4", libelle: "BAC" },
      });
      const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/23830024203.svg");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.message, "Données non disponibles");
    });

    it("Vérifie qu'on obtient une erreur avec une direction invalide", async () => {
      await insertRegionalesStats({ code_certification: "23830024203", millesime: "2018" });
      const { httpClient } = await startServer();

      const response = await httpClient.get(
        "/api/inserjeunes/regionales/11/certifications/23830024203.svg?direction=diagonal"
      );

      assert.strictEqual(response.status, 400);
    });
  });
});