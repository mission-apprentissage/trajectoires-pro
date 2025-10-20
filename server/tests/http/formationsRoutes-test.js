import * as chai from "chai";
import { assert, expect } from "chai";
import chaiDiff from "chai-diff";
import chaiDom from "chai-dom";
import fs from "fs";
import MockDate from "mockdate";
import config from "#src/config.js";
import { startServer } from "#tests/utils/testUtils.js";
import { insertFormationsStats, insertUser, insertAcceEtablissement, insertCFD } from "#tests/utils/fakeData.js";

chai.use(chaiDiff);
chai.use(chaiDom);

describe("formationsRoutes", () => {
  describe("Recherche", () => {
    function getAuthHeaders() {
      return {
        "x-api-key": config.inserJeunes.api.key,
      };
    }

    it("Vérifie qu'on peut obtenir les stats d'une formation", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
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

      const response = await httpClient.get(`/api/inserjeunes/formations`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        formations: [
          {
            uai: "0751234J",
            libelle_etablissement: "Lycée",
            code_certification: "12345678",
            code_certification_type: "cfd",
            code_formation_diplome: "12345678",
            libelle: "LIBELLE",
            millesime: "2018_2019",
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
            academie: {
              code: "01",
              nom: "Paris",
            },
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

    it("Vérifie qu'on peut obtenir les stats d'une formation avec a un millésime unique", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018",
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

      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2019",
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

      const response = await httpClient.get(`/api/inserjeunes/formations`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        formations: [
          {
            uai: "0751234J",
            libelle_etablissement: "Lycée",
            code_certification: "12345678",
            code_certification_type: "cfd",
            code_formation_diplome: "12345678",
            libelle: "LIBELLE",
            millesime: "2019",
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
            academie: {
              code: "01",
              nom: "Paris",
            },
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
      await insertFormationsStats();
      await insertFormationsStats();

      const response = await httpClient.get(`/api/inserjeunes/formations?items_par_page=1`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations.length, 1);
    });

    it("Vérifie qu'on peut paginer les résultats", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ uai: "0751234J" });
      await insertFormationsStats({ uai: "0751234X" });

      const response = await httpClient.get(`/api/inserjeunes/formations?items_par_page=1&page=2`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations.length, 1);
      assert.strictEqual(response.data.formations[0].uai, "0751234X");
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour un établissement", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ uai: "0751234J" });
      await insertFormationsStats({ uai: "0751234X" });

      const response = await httpClient.get(`/api/inserjeunes/formations?uais=0751234J`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations[0].uai, "0751234J");
      assert.strictEqual(response.data.pagination.total, 1);
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour un millesime", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ millesime: "2018_2019" });
      await insertFormationsStats({ millesime: "2020_2021" });

      const response = await httpClient.get(`/api/inserjeunes/formations?millesimes=2018_2019`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations[0].millesime, "2018_2019");
      assert.strictEqual(response.data.pagination.total, 1);
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour un millesime unique", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ millesime: "2018_2019" });
      await insertFormationsStats({ millesime: "2019" });
      await insertFormationsStats({ millesime: "2020_2021" });

      const response = await httpClient.get(`/api/inserjeunes/formations?millesimes=2019`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations[0].millesime, "2018_2019");
      assert.strictEqual(response.data.formations[1].millesime, "2019");
      assert.strictEqual(response.data.pagination.total, 2);
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour une région", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ region: { code: "76", nom: "Occitanie" } });
      await insertFormationsStats({ region: { code: "11", nom: "Île-de-France" } });

      const response = await httpClient.get(`/api/inserjeunes/formations?regions=76`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.formations[0].region.code, "76");
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour une académie", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ academie: { code: "01", nom: "Paris" } });
      await insertFormationsStats({ academie: { code: "08", nom: "Grenoble" } });

      const response = await httpClient.get(`/api/inserjeunes/formations?academies=08`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.pagination.total, 1);
      assert.strictEqual(response.data.formations[0].academie.code, "08");
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour un code formation", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ code_certification: "12345678" });
      await insertFormationsStats({ code_certification: "67890123" });

      const response = await httpClient.get(`/api/inserjeunes/formations?code_certifications=12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations[0].code_certification, "12345678");
      assert.strictEqual(response.data.pagination.total, 1);
    });

    it("Vérifie qu'on peut obtenir les stats de formations pour un code formation au format XXX:XXX", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ code_certification: "12345678" });
      await insertFormationsStats({ code_certification: "67890123" });

      const response = await httpClient.get(`/api/inserjeunes/formations?code_certifications=CFD:12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations[0].code_certification, "12345678");
      assert.strictEqual(response.data.pagination.total, 1);
    });

    it("Vérifie que l'on met les taux et les nombres à null pour les effectifs < 20", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678" });
      await insertAcceEtablissement({ numero_uai: "0751234J" });

      await insertFormationsStats({
        uai: "0751234J",
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

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.uai, "0751234J");
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
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
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

      const response = await httpClient.get(`/api/inserjeunes/formations.csv`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
      assert.deepStrictEqual(
        response.data,
        `uai;uai_type;uai_donnee;uai_donnee_type;code_certification;code_formation_diplome;filiere;millesime;donnee_source_type;donnee_source_code_certification;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_18_mois;nb_en_emploi_24_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_autres_12_mois;taux_autres_18_mois;taux_autres_24_mois;taux_autres_6_mois;taux_en_emploi_12_mois;taux_en_emploi_18_mois;taux_en_emploi_24_mois;taux_en_emploi_6_mois;taux_en_formation;taux_rupture_contrats
0751234J;;;;12345678;12345678;apprentissage;2018_2019;self;12345678;19;null;null;null;null;null;null;null;null;null;null;null;null;null;null;null;null
`
      );
    });

    it("Vérifie qu'on peut exporter les données au format CSV", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
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

      const response = await httpClient.get(`/api/inserjeunes/formations.csv`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
      assert.deepStrictEqual(
        response.data,
        `uai;uai_type;uai_donnee;uai_donnee_type;code_certification;code_formation_diplome;filiere;millesime;donnee_source_type;donnee_source_code_certification;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_18_mois;nb_en_emploi_24_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_autres_12_mois;taux_autres_18_mois;taux_autres_24_mois;taux_autres_6_mois;taux_en_emploi_12_mois;taux_en_emploi_18_mois;taux_en_emploi_24_mois;taux_en_emploi_6_mois;taux_en_formation;taux_rupture_contrats
0751234J;;;;12345678;12345678;apprentissage;2018_2019;self;12345678;100;4;3;2;5;1;6;14;15;16;13;11;10;9;12;8;7
`
      );
    });

    it("Vérifie qu'on peut exporter les données au format CSV pour le superieur", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0062205P",
        code_certification: "2500200",
        code_certification_type: "sise",
        code_formation_diplome: null,
        millesime: "2018_2019",
        filiere: "superieur",
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

      const response = await httpClient.get(`/api/inserjeunes/formations.csv`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
      assert.deepStrictEqual(
        response.data,
        `uai;uai_type;uai_donnee;uai_donnee_type;code_certification;code_formation_diplome;filiere;millesime;donnee_source_type;donnee_source_code_certification;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_18_mois;nb_en_emploi_24_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_autres_12_mois;taux_autres_18_mois;taux_autres_24_mois;taux_autres_6_mois;taux_en_emploi_12_mois;taux_en_emploi_18_mois;taux_en_emploi_24_mois;taux_en_emploi_6_mois;taux_en_formation;taux_rupture_contrats
0062205P;;;;2500200;;superieur;2018_2019;self;2500200;100;4;3;2;5;1;6;14;15;16;13;11;10;9;12;8;7
`
      );
    });

    it("Vérifie qu'on retourne une 400 si le code d'académie n'est pas valide", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/formations?academies=99`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 400);
      assert.deepStrictEqual(response.data, {
        details: [
          {
            context: {
              key: 0,
              label: "academies[0]",
              value: "99",
              valids: [
                "40",
                "42",
                "44",
                "41",
                "77",
                "78",
                "32",
                "31",
                "33",
                "28",
                "43",
                "01",
                "24",
                "25",
                "18",
                "07",
                "03",
                "70",
                "20",
                "09",
                "19",
                "12",
                "15",
                "17",
                "14",
                "13",
                "22",
                "04",
                "16",
                "11",
                "10",
                "06",
                "08",
                "02",
                "23",
                "27",
              ],
            },
            message: '"academies[0]" must be a valid academie code',
            path: ["academies", 0],
            type: "any.only",
          },
        ],
        error: "Bad Request",
        message: "Erreur de validation",
        statusCode: 400,
      });
    });

    it("Vérifie qu'on retourne une 400 si les paramètres sont invalides", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/formations?invalid=true`, {
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

      const response = await httpClient.get(`/api/inserjeunes/formations`);

      assert.strictEqual(response.status, 401);
    });

    it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/formations?apiKey=${config.inserJeunes.api.key}`);

      assert.strictEqual(response.status, 200);
    });

    it("Vérifie que l'on peut passer un JWT", async () => {
      const { httpClient } = await startServer();

      await insertUser();
      const token = await httpClient.post(`/api/inserjeunes/auth/login`, "username=test&password=Password1234!");

      const response = await httpClient.get(`/api/inserjeunes/formations`, {
        headers: {
          Authorization: `Bearer ${token.data.token}`,
        },
      });

      assert.strictEqual(response.status, 200);
    });

    it("Vérifie que l'on retourne une 401 si le JWT n'est pas valide", async () => {
      const { httpClient } = await startServer();
      const response = await httpClient.get(`/api/inserjeunes/formations`, {
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

      const response = await httpClient.get(`/api/inserjeunes/formations`, {
        headers: {
          Authorization: `Bearer ${token.data.token}`,
        },
      });

      assert.strictEqual(response.status, 401);
      MockDate.reset();
    });
  });

  describe("Obtention", () => {
    it("Vérifie qu'on peut obtenir une formation", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2017_2018",
      });
      await insertFormationsStats({
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
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

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        uai: "0751234J",
        libelle_etablissement: "Lycée",
        code_certification: "12345678",
        code_certification_type: "cfd",
        code_formation_diplome: "12345678",
        libelle: "LIBELLE",
        millesime: "2018_2019",
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
        academie: {
          code: "01",
          nom: "Paris",
        },
        donnee_source: {
          code_certification: "12345678",
          type: "self",
        },
        _meta: {
          titre: "Certification 12345678, établissement 0751234J",
          details:
            "Données InserJeunes pour la certification 12345678 (BAC filière apprentissage) dispensée par l'établissement 0751234J, pour le millésime 2018_2019",
        },
      });
    });

    it("Vérifie que l'on retourne en priorité un millésime unique si disponible", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018_2019",
      });
      await insertFormationsStats({
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2019",
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

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        uai: "0751234J",
        libelle_etablissement: "Lycée",
        code_certification: "12345678",
        code_certification_type: "cfd",
        code_formation_diplome: "12345678",
        libelle: "LIBELLE",
        millesime: "2019",
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
        academie: {
          code: "01",
          nom: "Paris",
        },
        donnee_source: {
          code_certification: "12345678",
          type: "self",
        },
        _meta: {
          titre: "Certification 12345678, établissement 0751234J",
          details:
            "Données InserJeunes pour la certification 12345678 (BAC filière apprentissage) dispensée par l'établissement 0751234J, pour le millésime 2019",
        },
      });
    });

    it("Vérifie qu'on peut obtenir une formation avec le format XXX:XXX", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2017_2018",
      });
      await insertFormationsStats({
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
        nb_annee_term: 100,
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-CFD:12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepInclude(response.data, {
        uai: "0751234J",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
        filiere: "apprentissage",
        nb_annee_term: 100,
      });
    });

    it("Vérifie que l'on renvoi l'information si la formation est fermée", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
        date_fermeture: new Date("2010-01-01T00:00:00.000Z"),
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepInclude(response.data, {
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
        formation_fermee: true,
      });
    });

    it("Vérifie que l'on renvoi l'information si la formation est ouverte", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
        date_fermeture: new Date(Date.now() + 24 * 3600),
      });

      // Sans date de fermeture
      await insertFormationsStats({
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345679",
        code_formation_diplome: "12345679",
        millesime: "2018_2019",
      });

      const responseWithDate = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);
      assert.strictEqual(responseWithDate.status, 200);
      assert.deepInclude(responseWithDate.data, {
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        millesime: "2018_2019",
        formation_fermee: false,
      });

      const responseWithoutDate = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345679`);
      assert.strictEqual(responseWithoutDate.status, 200);
      assert.deepInclude(responseWithoutDate.data, {
        uai: "0751234J",
        filiere: "apprentissage",
        code_certification: "12345679",
        code_formation_diplome: "12345679",
        millesime: "2018_2019",
        formation_fermee: false,
      });
    });

    it("Vérifie qu'on peut obtenir une année non terminale", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats(
        {
          uai: "0751234J",
          code_certification: "12345678910",
          code_formation_diplome: "12345678",
          filiere: "pro",
          certificationsTerminales: [{ code_certification: "32220000000" }],
        },
        false
      );

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678910`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        millesime: "2018_2019",
        code_certification: "12345678910",
        code_certification_type: "mef11",
        code_formation_diplome: "12345678",
        libelle: "LIBELLE",
        libelle_etablissement: "Lycée",
        filiere: "pro",
        diplome: { code: "4", libelle: "BAC" },
        certificationsTerminales: [{ code_certification: "32220000000" }],
        donnee_source: {
          code_certification: "12345678910",
          type: "self",
        },
        academie: {
          code: "01",
          nom: "Paris",
        },
        region: {
          code: "11",
          nom: "Île-de-France",
        },
        uai: "0751234J",
        formation_fermee: false,
        _meta: {
          titre: "Certification 12345678910, établissement 0751234J",
          details:
            "Données InserJeunes pour la certification 12345678910 (BAC filière pro) dispensée par l'établissement 0751234J, pour le millésime 2018_2019",
        },
      });
    });

    it("Ne retourne pas de stats par défaut si il n'y a pas de données pour le millésime le plus récent", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678" });
      await insertAcceEtablissement({ numero_uai: "0751234J" });

      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2017_2018",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Pas de données pour le millésime",
        data: {
          millesime: "2019",
          millesimesDisponible: ["2017_2018"],
        },
        statusCode: 404,
      });
    });

    it("Vérifie qu'on peut obtenir une formation et un millesime", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2017_2018",
      });
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018_2019",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2017_2018`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2017_2018");
    });

    it("Vérifie qu'on peut obtenir une formation et un millesime unique", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018",
      });
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2019",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2019`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2019");
    });

    it("Vérifie qu'on obtient en priorité un millésime unique en demandant un millésime unique si les données sont disponibles également en aggrégés", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018_2019",
      });
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2019",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2019`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2019");
    });

    it("Vérifie qu'on peut obtenir une formation avec un millésime aggregé en demandant un millesime unique", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018",
      });
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018_2019",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2019`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2018_2019");
    });

    it("Vérifie qu'on peut obtenir une formation avec un millésime unique en demandant un millesime aggregé", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2019",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2018_2019`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2019");
    });

    it("Ne retourne pas de stats en demandant un millésime unique si il ne correspond pas à la dernière année d'un millésime aggregé", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678" });
      await insertAcceEtablissement({ numero_uai: "0751234J" });

      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2019_2020",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2019`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Pas de données pour le millésime",
        data: {
          millesime: "2019",
          millesimesDisponible: ["2019_2020"],
        },
        statusCode: 404,
      });
    });

    it("Ne retourne pas de stats en demandant un millésime agregé si sa dernière année ne correspond pas à un millésime unique", async () => {
      const { httpClient } = await startServer();
      await insertCFD({ code_certification: "12345678" });
      await insertAcceEtablissement({ numero_uai: "0751234J" });

      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2019",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2019_2020`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Pas de données pour le millésime",
        data: {
          millesime: "2019_2020",
          millesimesDisponible: ["2019"],
        },
        statusCode: 404,
      });
    });

    it("Vérifie qu'on retourne une 404 si la formation est inconnue", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Formation inconnue",
        statusCode: 404,
      });
    });
  });

  describe("Widget", () => {
    function createDefaultStats(data = {}) {
      return insertFormationsStats({
        uai: "0751234J",
        code_certification: "10221058",
        taux_en_emploi_6_mois: 50,
        taux_en_formation: 25,
        taux_autres_6_mois: 12,
        nb_annee_term: 20,
        ...data,
      });
    }

    const themes = ["dsfr", "lba"];
    themes.forEach((theme) => {
      describe("Theme " + theme, () => {
        it("Vérifie qu'on peut obtenir une image SVG", async () => {
          const { httpClient } = await startServer();
          await createDefaultStats();

          const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?theme=" + theme);

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/0751234J-10221058.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie qu'on peut obtenir une image SVG pour un millésime unique", async () => {
          const { httpClient } = await startServer();
          await createDefaultStats({ millesime: "2019" });

          const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?theme=" + theme);

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/0751234J-10221058_2019.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie qu'on peut obtenir une image SVG horizontale", async () => {
          const { httpClient } = await startServer();
          await createDefaultStats();

          const response = await httpClient.get(
            "/api/inserjeunes/formations/0751234J-10221058.svg?direction=horizontal&theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/0751234J-10221058_horizontal.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie la description pour l'emploi public pour les millésimes supérieur à 2021_2022", async () => {
          const { httpClient } = await startServer();
          await insertFormationsStats({
            uai: "0751234J",
            code_certification: "10221058",
            millesime: "2021_2022",
            taux_en_emploi_6_mois: 50,
            taux_en_formation: 25,
            taux_autres_6_mois: 12,
            nb_annee_term: 20,
          });

          const response = await httpClient.get(
            "/api/inserjeunes/formations/0751234J-10221058.svg?direction=vertical&millesime=2021_2022&theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/2021_2022_0751234J-10221058.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie qu'on peut obtenir une image SVG avec une seule donnée disponible (vertical)", async () => {
          const { httpClient } = await startServer();
          await insertFormationsStats(
            { uai: "0751234J", code_certification: "10221058", nb_annee_term: 20, taux_en_emploi_6_mois: 50 },
            false
          );

          const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?theme=" + theme);

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/0751234J-10221058_vertical.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie qu'on peut obtenir une image SVG avec une seule donnée disponible (horizontale)", async () => {
          const { httpClient } = await startServer();
          await insertFormationsStats(
            { uai: "0751234J", code_certification: "10221058", nb_annee_term: 20, taux_en_emploi_6_mois: 50 },
            false
          );

          const response = await httpClient.get(
            "/api/inserjeunes/formations/0751234J-10221058.svg?direction=horizontal&theme=" + theme
          );

          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/0751234J-10221058_one_data_horizontal.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        it("Vérifie qu'on peut obtenir une image SVG avec une donnée égale à 0", async () => {
          const { httpClient } = await startServer();
          await insertFormationsStats(
            {
              uai: "0751234J",
              code_certification: "10221058",
              nb_annee_term: 20,
              taux_en_formation: 0,
              taux_en_emploi_6_mois: 50,
              taux_autres_6_mois: 10,
            },
            false
          );

          const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?theme=" + theme);
          assert.strictEqual(response.status, 200);
          assert.ok(response.headers["content-type"].includes("image/svg+xml"));

          const svgFixture = await fs.promises.readFile(
            `tests/fixtures/widgets/${theme}/formations/0751234J-10221058_data_0.svg`,
            "utf8"
          );
          expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
        });

        describe("Vérifie qu'on obtient une image en cas d'erreur avec le paramètre imageOnError", () => {
          it("La formation n'existe pas", async () => {
            const { httpClient } = await startServer();

            const response = await httpClient.get(
              "/api/inserjeunes/formations/0751234J-10221058.svg?imageOnError=true&theme=" + theme
            );

            assert.strictEqual(response.status, 200);
            assert.ok(response.headers["content-type"].includes("image/svg+xml"));

            const svgFixture = await fs.promises.readFile(
              `tests/fixtures/widgets/${theme}/formations/error.svg`,
              "utf8"
            );
            expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
          });

          it("Pas de données pour le millésime", async () => {
            const { httpClient } = await startServer();

            await insertFormationsStats({
              uai: "0751234J",
              code_certification: "10221058",
              taux_en_emploi_6_mois: 50,
              taux_en_formation: 25,
              taux_autres_6_mois: 12,
              nb_annee_term: 20,
              millesime: "2017_2018",
            });

            const response = await httpClient.get(
              "/api/inserjeunes/formations/0751234J-10221058.svg?imageOnError=true&theme=" + theme
            );

            assert.strictEqual(response.status, 200);
            assert.ok(response.headers["content-type"].includes("image/svg+xml"));

            const svgFixture = await fs.promises.readFile(
              `tests/fixtures/widgets/${theme}/formations/error.svg`,
              "utf8"
            );
            expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
          });
        });
      });
    });

    it("Retourne le theme DSFR par défaut", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));

      const svgFixture = await fs.promises.readFile(
        `tests/fixtures/widgets/dsfr/formations/0751234J-10221058.svg`,
        "utf8"
      );
      expect(svgFixture).not.differentFrom(response.data, { relaxedSpace: true });
    });

    describe("Vérifie qu'on obtient une erreur quand la statistique n'existe pas", async () => {
      it("Retourne une erreur par défaut", async () => {
        const { httpClient } = await startServer();
        const response = await httpClient.get("/api/inserjeunes/formations/0751234P-10221058.svg");

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Formation inconnue");
      });

      it("Retourne une image vide quand imageOnError est empty", async () => {
        const { httpClient } = await startServer();

        const response = await httpClient.get("/api/inserjeunes/formations/0751234P-10221058.svg?imageOnError=empty");

        const svgFixture = await fs.promises.readFile(`tests/fixtures/widgets/dsfr/formations/error_empty.svg`, "utf8");

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data, svgFixture);
      });

      it("Quand imageOnError est false", async () => {
        const { httpClient } = await startServer();

        const response = await httpClient.get("/api/inserjeunes/formations/0751234P-10221058.svg?imageOnError=false");

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Formation inconnue");
      });
    });

    describe("Vérifie qu'on obtient une erreur quand il n'y a pas de données disponible pour la stats", async () => {
      it("Retourne une erreur par défaut", async () => {
        const { httpClient } = await startServer();
        await insertFormationsStats({ uai: "0751234J", code_certification: "10221058" }, false);

        const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg");

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Données non disponibles");
      });

      it("Retourne une image vide quand imageOnError est empty", async () => {
        const { httpClient } = await startServer();
        await insertFormationsStats({ uai: "0751234J", code_certification: "10221058" }, false);

        const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?imageOnError=empty");
        const svgFixture = await fs.promises.readFile(`tests/fixtures/widgets/dsfr/formations/error_empty.svg`, "utf8");

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data, svgFixture);
      });

      it("Quand imageOnError est false", async () => {
        const { httpClient } = await startServer();
        await insertFormationsStats({ uai: "0751234J", code_certification: "10221058" }, false);

        const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?imageOnError=false");

        assert.strictEqual(response.status, 404);
        assert.strictEqual(response.data.message, "Données non disponibles");
      });
    });

    it("Vérifie qu'on obtient une erreur quand le format de l'UAI est invalide", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get("/api/inserjeunes/formations/INVALIDE-23220023440.svg");

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.message, "Erreur de validation");
    });

    it("Vérifie qu'on obtient une erreur avec une direction invalide", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-10221058.svg?direction=diagonal");

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.message, "Erreur de validation");
    });
  });
});
