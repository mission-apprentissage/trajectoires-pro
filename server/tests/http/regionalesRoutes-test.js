import chai, { expect } from "chai";
import chaiDiff from "chai-diff";
import chaiDom from "chai-dom";
import fs from "fs";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import MockDate from "mockdate";
import config from "#src/config.js";
import { startServer } from "#tests/utils/testUtils.js";
import { insertCFD, insertMEF, insertRegionalesStats, insertUser } from "#tests/utils/fakeData.js";

chai.use(deepEqualInAnyOrder);
chai.use(chaiDiff);
chai.use(chaiDom);
const { assert } = chai;

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
        millesime: "2018_2019",
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
            millesime: "2018_2019",
            code_certification: "12345678",
            code_certification_type: "cfd",
            code_formation_diplome: "12345678",
            libelle: "LIBELLE",
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
            formation_fermee: false,
            donnee_source: {
              code_certification: "12345678",
              type: "self",
            },
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

    it("Vérifie qu'on peut obtenir les stats régionales pour une région", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ millesime: "2018_2019" });
      await insertRegionalesStats({ millesime: "2018_2019", region: { code: "24", nom: "Centre-Val de Loire" } });

      const response = await httpClient.get(`/api/inserjeunes/regionales?regions=11`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.regionales[0].millesime, "2018_2019");
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

    it("Vérifie qu'on peut obtenir les stats de formations pour un code formation", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345678" });
      await insertRegionalesStats({ code_certification: "67890123" });

      const response = await httpClient.get(`/api/inserjeunes/regionales?code_certifications=12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.regionales[0].code_certification, "12345678");
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour un code formation au format XXX:XXX", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345678" });
      await insertRegionalesStats({ code_certification: "67890123" });

      const response = await httpClient.get(`/api/inserjeunes/regionales?code_certifications=CFD:12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.regionales[0].code_certification, "12345678");
    });

    it("Vérifie que l'on met les taux et les nombres à null pour les effectifs < 20", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        code_certification: "12345678",
        nb_annee_term: 19,
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

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.code_certification, "12345678");
      assert.include(response.data, {
        taux_rupture_contrats: null,
        taux_en_formation: null,
        taux_en_emploi_24_mois: null,
        taux_en_emploi_18_mois: null,
        taux_en_emploi_12_mois: null,
        taux_en_emploi_6_mois: null,
        taux_autres_6_mois: null,
        taux_autres_12_mois: null,
        taux_autres_18_mois: null,
        taux_autres_24_mois: null,
        nb_poursuite_etudes: null,
        nb_en_emploi_24_mois: null,
        nb_en_emploi_18_mois: null,
        nb_en_emploi_12_mois: null,
        nb_en_emploi_6_mois: null,
        nb_sortant: null,
      });
      assert.deepNestedInclude(response.data, {
        "_meta.messages": [
          `Les taux ne peuvent pas être affichés car il n'y a pas assez d'élèves pour fournir une information fiable.`,
        ],
      });
    });

    it("Vérifie que l'on met les taux et les nombres à null pour les effectifs < 20 au format CSV", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        nb_annee_term: 19,
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
        `region;code_certification;code_formation_diplome;filiere;millesime;donnee_source_type;donnee_source_code_certification;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_18_mois;nb_en_emploi_24_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_autres_12_mois;taux_autres_18_mois;taux_autres_24_mois;taux_autres_6_mois;taux_en_emploi_12_mois;taux_en_emploi_18_mois;taux_en_emploi_24_mois;taux_en_emploi_6_mois;taux_en_formation;taux_rupture_contrats
Île-de-France;12345678;12345678;apprentissage;2018_2019;self;12345678;19;null;null;null;null;null;null;null;null;null;null;null;null;null;null;null;null
`
      );
    });

    it("Vérifie qu'on peut exporter les données au format CSV", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
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

      const response = await httpClient.get(`/api/inserjeunes/regionales.csv`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
      assert.deepStrictEqual(
        response.data,
        `region;code_certification;code_formation_diplome;filiere;millesime;donnee_source_type;donnee_source_code_certification;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_18_mois;nb_en_emploi_24_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_autres_12_mois;taux_autres_18_mois;taux_autres_24_mois;taux_autres_6_mois;taux_en_emploi_12_mois;taux_en_emploi_18_mois;taux_en_emploi_24_mois;taux_en_emploi_6_mois;taux_en_formation;taux_rupture_contrats
Île-de-France;12345678;12345678;apprentissage;2018_2019;self;12345678;100;4;3;2;5;1;6;14;15;16;13;11;10;9;12;8;7
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

    it("Vérifie que l'on peut passer un JWT", async () => {
      const { httpClient } = await startServer();

      await insertUser();
      const token = await httpClient.post(`/api/inserjeunes/auth/login`, "username=test&password=Password1234!");

      const response = await httpClient.get(`/api/inserjeunes/regionales`, {
        headers: {
          Authorization: `Bearer ${token.data.token}`,
        },
      });

      assert.strictEqual(response.status, 200);
    });

    it("Vérifie que l'on retourne une 401 si le JWT n'est pas valide", async () => {
      const { httpClient } = await startServer();
      const response = await httpClient.get(`/api/inserjeunes/regionales`, {
        headers: {
          Authorization: `Bearer invalide`,
        },
      });

      assert.strictEqual(response.status, 401);
    });

    it("Vérifie que l'on retourne une 401 si le JWT a expiré", async () => {
      MockDate.set("2023-01-01");
      const { httpClient } = await startServer();

      await insertUser();
      const token = await httpClient.post(`/api/inserjeunes/auth/login`, "username=test&password=Password1234!");

      MockDate.set("2023-01-02");

      const response = await httpClient.get(`/api/inserjeunes/regionales`, {
        headers: {
          Authorization: `Bearer ${token.data.token}`,
        },
      });

      assert.strictEqual(response.status, 401);
      MockDate.reset();
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
        millesime: "2018_2019",
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
            millesime: "2018_2019",
            code_certification: "12345678",
            code_certification_type: "cfd",
            code_formation_diplome: "12345678",
            libelle: "LIBELLE",
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
            formation_fermee: false,
            donnee_source: {
              code_certification: "12345678",
              type: "self",
            },
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

    it("Vérifie qu'on peut obtenir les stats pour une région en utilisant un code postal", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
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

      const response = await httpClient.get(`/api/inserjeunes/regionales/75000`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        regionales: [
          {
            region: { code: "11", nom: "Île-de-France" },
            millesime: "2018_2019",
            code_certification: "12345678",
            code_certification_type: "cfd",
            code_formation_diplome: "12345678",
            libelle: "LIBELLE",
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
            formation_fermee: false,
            donnee_source: {
              code_certification: "12345678",
              type: "self",
            },
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
        millesime: "2018_2019",
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
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2017_2018" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        millesime: "2018_2019",
        code_certification: "12345678",
        code_certification_type: "cfd",
        code_formation_diplome: "12345678",
        libelle: "LIBELLE",
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
        formation_fermee: false,
        region: { code: "11", nom: "Île-de-France" },
        donnee_source: {
          code_certification: "12345678",
          type: "self",
        },
        _meta: {
          titre: "Certification 12345678",
          details:
            "Données InserJeunes pour la certification 12345678 (BAC filière apprentissage) pour le millésime 2018_2019 et la région Île-de-France",
        },
      });
    });

    it("Vérifie qu'on peut obtenir la stats pour un code au format XXX:XXX", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        nb_annee_term: 100,
      });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2017_2018" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/CFD:12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepInclude(response.data, {
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        libelle: "LIBELLE",
        filiere: "apprentissage",
        diplome: { code: "4", libelle: "BAC" },
        nb_annee_term: 100,
      });
    });

    it("Vérifie que l'on renvoi l'information si la formation est fermée", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        date_fermeture: new Date("2010-01-01T00:00:00.000Z"),
      });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepInclude(response.data, {
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        formation_fermee: true,
      });
    });

    it("Vérifie que l'on renvoi l'information si la formation est ouverte", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        date_fermeture: new Date(Date.now() + 24 * 3600),
      });

      // Sans date de fermeture
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        code_certification: "12345679",
        code_formation_diplome: "12345679",
        filiere: "apprentissage",
      });

      const responseWithDate = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);
      assert.strictEqual(responseWithDate.status, 200);
      assert.deepInclude(responseWithDate.data, {
        millesime: "2018_2019",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        formation_fermee: false,
      });

      const responseWithoutDate = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345679`);
      assert.strictEqual(responseWithoutDate.status, 200);
      assert.deepInclude(responseWithoutDate.data, {
        millesime: "2018_2019",
        code_certification: "12345679",
        code_formation_diplome: "12345679",
        filiere: "apprentissage",
        formation_fermee: false,
      });
    });

    it("Vérifie qu'on peut obtenir une année non terminale", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats(
        {
          region: { code: "11", nom: "Île-de-France" },
          code_certification: "12345678910",
          code_formation_diplome: "12345678",
          filiere: "pro",
          certificationsTerminales: [{ code_certification: "32220000000" }],
        },
        false
      );

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678910`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        millesime: "2018_2019",
        code_certification: "12345678910",
        code_certification_type: "mef11",
        code_formation_diplome: "12345678",
        libelle: "LIBELLE",
        filiere: "pro",
        diplome: { code: "4", libelle: "BAC" },
        certificationsTerminales: [{ code_certification: "32220000000" }],
        donnee_source: {
          code_certification: "12345678910",
          type: "self",
        },
        region: {
          code: "11",
          nom: "Île-de-France",
        },
        formation_fermee: false,
        _meta: {
          titre: "Certification 12345678910",
          details:
            "Données InserJeunes pour la certification 12345678910 (BAC filière pro) pour le millésime 2018_2019 et la région Île-de-France",
        },
      });
    });

    it("Ne retourne pas de stats par défaut si il n'y a pas de données pour le millésime le plus récent", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678" });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2017_2018" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Pas de données pour le millésime",
        data: {
          millesime: "2018_2019",
          millesimesDisponible: ["2017_2018"],
        },
        statusCode: 404,
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

    it("Vérifie qu'on peut obtenir une certification pour un millesime et un code postal", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2018" });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2019" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/75000/certifications/12345678?millesime=2018`);

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
          millesime: "2018_2019",
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
          millesime: "2018_2019",
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
          codes_formation_diplome: ["12345678"],
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          filiere: "apprentissage",
          libelle: "LIBELLE",
          millesime: "2018_2019",
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
          formation_fermee: false,
        },
        pro: {
          codes_certifications: ["23830024202"],
          code_formation_diplome: "12345678",
          codes_formation_diplome: ["12345678"],
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          filiere: "pro",
          libelle: "LIBELLE",
          millesime: "2018_2019",
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
          formation_fermee: false,
        },
      });
    });

    it("Vérifie qu'on retourne une 404 si la certification n'a pas de donnée'", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Pas de données disponibles",
        statusCode: 404,
      });
    });

    it("Vérifie qu'on retourne une 404 si la certification est inconnue", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Formation inconnue",
        statusCode: 404,
      });
    });

    it("Vérifie qu'on retourne une erreur 400 si la région n'est pas valide", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2018" });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2019" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/12/certifications/12345678?millesime=2018`);

      assert.strictEqual(response.status, 400);
      assert.deepStrictEqual(response.data, {
        statusCode: 400,
        error: "Bad Request",
        message: "Erreur de validation",
        details: [
          {
            message:
              '"region" must be one of [00, 01, 02, 03, 04, 06, 11, 24, 27, 28, 32, 44, 52, 53, 75, 76, 84, 93, 94]',
            path: ["region"],
            type: "any.only",
            context: {
              valids: [
                "00",
                "01",
                "02",
                "03",
                "04",
                "06",
                "11",
                "24",
                "27",
                "28",
                "32",
                "44",
                "52",
                "53",
                "75",
                "76",
                "84",
                "93",
                "94",
              ],
              label: "region",
              value: "12",
              key: "region",
            },
          },
        ],
      });
    });

    it("Vérifie qu'on retourne une erreur 400 si le code postal n'est pas valide", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2018" });
      await insertRegionalesStats({ code_certification: "12345678", millesime: "2019" });

      const response = await httpClient.get(`/api/inserjeunes/regionales/99000/certifications/12345678?millesime=2018`);

      assert.strictEqual(response.status, 400);
      assert.deepStrictEqual(response.data, {
        statusCode: 400,
        error: "Bad Request",
        message: "Erreur de validation",
        details: [
          {
            message: '"region" must be a valid postal code or region code',
            path: ["region"],
            type: "postal_code.invalid",
            context: {
              label: "region",
              value: "99000",
              key: "region",
            },
          },
        ],
      });
    });
  });

  describe("Widget", () => {
    const themes = ["dsfr", "lba"];
    themes.forEach((theme) => {
      describe("Theme " + theme, () => {
        it("Vérifie qu'on peut obtenir une image SVG", async () => {
          const { httpClient } = await startServer();
          await insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024203",
            filiere: "apprentissage",
            nb_annee_term: 20,
            taux_en_formation: 5,
            taux_autres_6_mois: 5,
            taux_en_emploi_6_mois: 8,
          });

          const response = await httpClient.get(
            "/api/inserjeunes/regionales/11/certifications/23830024203.svg?theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/regionales/23830024203.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie la description pour l'emploi public pour les millésimes supérieur à 2021_2022", async () => {
          const { httpClient } = await startServer();
          await insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024203",
            filiere: "apprentissage",
            millesime: "2021_2022",
            nb_annee_term: 20,
            taux_en_formation: 5,
            taux_autres_6_mois: 5,
            taux_en_emploi_6_mois: 8,
          });

          const response = await httpClient.get(
            "/api/inserjeunes/regionales/11/certifications/23830024203.svg?millesime=2021_2022&theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/regionales/2022_23830024203.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
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
              millesime: "2018_2019",
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
              millesime: "2018_2019",
              nb_sortant: 100,
              nb_annee_term: 50,
              nb_poursuite_etudes: 5,
              nb_en_emploi_24_mois: 25,
              nb_en_emploi_18_mois: 25,
              nb_en_emploi_12_mois: 25,
              nb_en_emploi_6_mois: 50,
            }),
          ]);

          const response = await httpClient.get(
            "/api/inserjeunes/regionales/11/certifications/12345678.svg?vue=filieres&theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/regionales/12345678_filiere.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie qu'on peut obtenir le widget avec une vue CFD quand il y a plusieurs CFD différents", async () => {
          const { httpClient } = await startServer();
          await Promise.all([
            insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" }),
            insertCFD({ code_certification: "87654321", code_formation_diplome: "87654321" }),
            insertRegionalesStats({
              region: { code: "11", nom: "Île-de-France" },
              code_certification: "12345678",
              code_formation_diplome: "12345678",
              filiere: "apprentissage",
              millesime: "2018_2019",
              nb_sortant: 100,
              nb_annee_term: 50,
              nb_poursuite_etudes: 5,
              nb_en_emploi_24_mois: 25,
              nb_en_emploi_18_mois: 25,
              nb_en_emploi_12_mois: 25,
              nb_en_emploi_6_mois: 50,
            }),
            insertRegionalesStats({
              region: { code: "11", nom: "Île-de-France" },
              code_certification: "87654321",
              code_formation_diplome: "87654321",
              filiere: "apprentissage",
              millesime: "2018_2019",
              nb_sortant: 100,
              nb_annee_term: 50,
              nb_poursuite_etudes: 5,
              nb_en_emploi_24_mois: 25,
              nb_en_emploi_18_mois: 25,
              nb_en_emploi_12_mois: 25,
              nb_en_emploi_6_mois: 50,
            }),
            insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" }),
            insertMEF({ code_certification: "23876543212", code_formation_diplome: "87654321" }),
            insertRegionalesStats({
              region: { code: "11", nom: "Île-de-France" },
              code_certification: "23830024202",
              code_formation_diplome: "12345678",
              filiere: "pro",
              millesime: "2018_2019",
              nb_sortant: 100,
              nb_annee_term: 50,
              nb_poursuite_etudes: 5,
              nb_en_emploi_24_mois: 25,
              nb_en_emploi_18_mois: 25,
              nb_en_emploi_12_mois: 25,
              nb_en_emploi_6_mois: 50,
            }),
            insertRegionalesStats({
              region: { code: "11", nom: "Île-de-France" },
              code_certification: "23876543212",
              code_formation_diplome: "87654321",
              filiere: "pro",
              millesime: "2018_2019",
              nb_sortant: 100,
              nb_annee_term: 50,
              nb_poursuite_etudes: 5,
              nb_en_emploi_24_mois: 25,
              nb_en_emploi_18_mois: 25,
              nb_en_emploi_12_mois: 25,
              nb_en_emploi_6_mois: 50,
            }),
          ]);

          const response = await httpClient.get(
            "/api/inserjeunes/regionales/11/certifications/12345678|23876543212.svg?vue=filieres&theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/regionales/12345678_87654321_filiere.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        describe("Vérifie qu'on obtient une image en cas d'erreur avec le paramètre imageOnError", () => {
          it("La formation n'existe pas", async () => {
            const { httpClient } = await startServer();

            const response = await httpClient.get(
              "/api/inserjeunes/regionales/11/certifications/23830024203.svg?imageOnError=true&theme=" + theme
            );

            assert.strictEqual(response.status, 200);
            assert.ok(response.headers["content-type"].includes("image/svg+xml"));

            const svgFixture = await fs.promises.readFile(
              `tests/fixtures/widgets/${theme}/regionales/error.svg`,
              "utf8"
            );
            expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
          });

          it("Pas de données pour le millésime", async () => {
            const { httpClient } = await startServer();

            await insertRegionalesStats({
              region: { code: "11", nom: "Île-de-France" },
              code_certification: "23830024203",
              filiere: "apprentissage",
              nb_annee_term: 20,
              taux_en_formation: 5,
              taux_autres_6_mois: 5,
              taux_en_emploi_6_mois: 8,
              millesime: "2017_2018",
            });

            const response = await httpClient.get(
              "/api/inserjeunes/regionales/11/certifications/23830024203.svg?imageOnError=true&theme=" + theme
            );

            assert.strictEqual(response.status, 200);
            assert.ok(response.headers["content-type"].includes("image/svg+xml"));

            const svgFixture = await fs.promises.readFile(
              `tests/fixtures/widgets/${theme}/regionales/error.svg`,
              "utf8"
            );
            expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
          });
        });
      });
    });

    it("Retourne le theme DSFR par défaut", async () => {
      const { httpClient } = await startServer();
      await insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "23830024203",
        filiere: "apprentissage",
        nb_annee_term: 20,
        taux_en_formation: 5,
        taux_autres_6_mois: 5,
        taux_en_emploi_6_mois: 8,
      });

      const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/23830024203.svg");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));

      const svgFixture = await fs.promises.readFile(`tests/fixtures/widgets/dsfr/regionales/23830024203.svg`, "utf8");
      expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
    });

    describe("Vérifie qu'on obtient une erreur quand la statistique n'existe pas", async () => {
      it("Retourne une erreur par défaut", async () => {
        const { httpClient } = await startServer();

        const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/12345678.svg");

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Formation inconnue");
      });

      it("Retourne une image vide quand imageOnError est empty", async () => {
        const { httpClient } = await startServer();

        const response = await httpClient.get(
          "/api/inserjeunes/regionales/11/certifications/12345678.svg?imageOnError=empty"
        );

        const svgFixture = await fs.promises.readFile(`tests/fixtures/widgets/dsfr/regionales/error_empty.svg`, "utf8");

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data, svgFixture);
      });

      it("Quand imageOnError est false", async () => {
        const { httpClient } = await startServer();

        const response = await httpClient.get(
          "/api/inserjeunes/regionales/11/certifications/12345678.svg?imageOnError=false"
        );

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Formation inconnue");
      });
    });

    describe("Vérifie qu'on obtient une erreur quand il n'y a pas de données disponible pour la stats", async () => {
      it("Retourne une erreur par défaut", async () => {
        const { httpClient } = await startServer();
        await insertRegionalesStats(
          {
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024203",
            code_formation_diplome: "12345678",
            millesime: "2018_2019",
            filiere: "apprentissage",
            diplome: { code: "4", libelle: "BAC" },
          },
          false
        );
        const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/23830024203.svg");

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Données non disponibles");
      });

      it("Retourne une image vide quand imageOnError est empty", async () => {
        const { httpClient } = await startServer();
        await insertRegionalesStats(
          {
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024203",
            code_formation_diplome: "12345678",
            millesime: "2018_2019",
            filiere: "apprentissage",
            diplome: { code: "4", libelle: "BAC" },
          },
          false
        );
        const response = await httpClient.get(
          "/api/inserjeunes/regionales/11/certifications/23830024203.svg?imageOnError=empty"
        );

        const svgFixture = await fs.promises.readFile(`tests/fixtures/widgets/dsfr/regionales/error_empty.svg`, "utf8");

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data, svgFixture);
      });

      it("Quand imageOnError est false", async () => {
        const { httpClient } = await startServer();
        await insertRegionalesStats(
          {
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024203",
            code_formation_diplome: "12345678",
            millesime: "2018_2019",
            filiere: "apprentissage",
            diplome: { code: "4", libelle: "BAC" },
          },
          false
        );
        const response = await httpClient.get(
          "/api/inserjeunes/regionales/11/certifications/23830024203.svg?imageOnError=false"
        );

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Données non disponibles");
      });
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

  describe("Vue filières", () => {
    describe("Lorsque que le CFD est identique pour toute les certifications", async () => {
      it("Vérifie qu'on peut obtenir les données pour deux filières (cfd)", async () => {
        const { httpClient } = await startServer();
        await Promise.all([
          insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" }),
          await insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
            libelle_ancien: "LIBELLE ANCIEN",
          }),
          await insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024202",
            code_formation_diplome: "12345678",
            filiere: "pro",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
            libelle_ancien: "LIBELLE ANCIEN",
          }),
        ]);

        const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/12345678,23830024202");

        assert.strictEqual(response.status, 200);
        assert.deepStrictEqual(response.data, {
          apprentissage: {
            codes_certifications: ["12345678"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "apprentissage",
            libelle: "LIBELLE",
            libelle_ancien: "LIBELLE ANCIEN",
            millesime: "2018_2019",
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
            formation_fermee: false,
          },
          pro: {
            codes_certifications: ["23830024202"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "pro",
            libelle: "LIBELLE",
            libelle_ancien: "LIBELLE ANCIEN",
            millesime: "2018_2019",
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
            formation_fermee: false,
          },
        });
      });

      it("Vérifie qu'on peut obtenir les données pour deux filières (mef)", async () => {
        const { httpClient } = await startServer();
        await Promise.all([
          insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024202",
            code_formation_diplome: "12345678",
            filiere: "pro",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
        ]);

        const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/12345678,23830024202");

        assert.strictEqual(response.status, 200);
        assert.deepStrictEqual(response.data, {
          apprentissage: {
            codes_certifications: ["12345678"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "apprentissage",
            libelle: "LIBELLE",
            millesime: "2018_2019",
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
            formation_fermee: false,
          },
          pro: {
            codes_certifications: ["23830024202"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "pro",
            libelle: "LIBELLE",
            millesime: "2018_2019",
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
            formation_fermee: false,
          },
        });
      });
    });

    describe("Lorsque que les certifications ont plusieurs CFD", async () => {
      it("Vérifie qu'on peut obtenir les données aggregées (cfd)", async () => {
        const { httpClient } = await startServer();
        await Promise.all([
          insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" }),
          insertCFD({ code_certification: "87654321", code_formation_diplome: "87654321" }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "87654321",
            code_formation_diplome: "87654321",
            filiere: "apprentissage",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024202",
            code_formation_diplome: "12345678",
            filiere: "pro",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23876543212",
            code_formation_diplome: "87654321",
            filiere: "pro",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
        ]);

        const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/12345678,87654321");

        assert.strictEqual(response.status, 200);
        assert.deepEqualInAnyOrder(response.data, {
          apprentissage: {
            codes_certifications: ["87654321", "12345678"],
            codes_formation_diplome: ["87654321", "12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "apprentissage",
            millesime: "2018_2019",
            nb_sortant: 200,
            nb_annee_term: 200,
            nb_poursuite_etudes: 10,
            nb_en_emploi_24_mois: 50,
            nb_en_emploi_18_mois: 50,
            nb_en_emploi_12_mois: 50,
            nb_en_emploi_6_mois: 100,
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
            codes_certifications: ["23830024202", "23876543212"],
            codes_formation_diplome: ["87654321", "12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "pro",
            millesime: "2018_2019",
            nb_sortant: 200,
            nb_annee_term: 200,
            nb_poursuite_etudes: 10,
            nb_en_emploi_24_mois: 50,
            nb_en_emploi_18_mois: 50,
            nb_en_emploi_12_mois: 50,
            nb_en_emploi_6_mois: 100,
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

      it("Vérifie qu'on peut obtenir les données aggregées (mef)", async () => {
        const { httpClient } = await startServer();
        await Promise.all([
          insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" }),
          insertMEF({ code_certification: "23876543212", code_formation_diplome: "87654321" }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "87654321",
            code_formation_diplome: "87654321",
            filiere: "apprentissage",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23830024202",
            code_formation_diplome: "12345678",
            filiere: "pro",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
          insertRegionalesStats({
            region: { code: "11", nom: "Île-de-France" },
            code_certification: "23876543212",
            code_formation_diplome: "87654321",
            filiere: "pro",
            nb_sortant: 100,
            nb_annee_term: 100,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
          }),
        ]);

        const response = await httpClient.get("/api/inserjeunes/regionales/11/certifications/23876543212,23830024202");

        assert.strictEqual(response.status, 200);
        assert.deepEqualInAnyOrder(response.data, {
          apprentissage: {
            codes_certifications: ["87654321", "12345678"],
            codes_formation_diplome: ["87654321", "12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "apprentissage",
            millesime: "2018_2019",
            nb_sortant: 200,
            nb_annee_term: 200,
            nb_poursuite_etudes: 10,
            nb_en_emploi_24_mois: 50,
            nb_en_emploi_18_mois: 50,
            nb_en_emploi_12_mois: 50,
            nb_en_emploi_6_mois: 100,
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
            codes_certifications: ["23876543212", "23830024202"],
            codes_formation_diplome: ["87654321", "12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            region: {
              code: "11",
              nom: "Île-de-France",
            },
            filiere: "pro",
            millesime: "2018_2019",
            nb_sortant: 200,
            nb_annee_term: 200,
            nb_poursuite_etudes: 10,
            nb_en_emploi_24_mois: 50,
            nb_en_emploi_18_mois: 50,
            nb_en_emploi_12_mois: 50,
            nb_en_emploi_6_mois: 100,
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
    });
  });
});
