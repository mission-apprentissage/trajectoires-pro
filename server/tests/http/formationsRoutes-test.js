import assert from "assert";
import config from "../../src/config.js";
import { startServer } from "../utils/testUtils.js";
import { insertFormationsStats } from "../utils/fakeData.js";
import { formationsStats } from "../../src/common/db/collections.js";

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
        millesime: "2018_2019",
        filiere: "apprentissage",
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 2,
        nb_en_emploi_6_mois: 3,
        nb_poursuite_etudes: 4,
        nb_sortant: 5,
        taux_emploi_12_mois: 6,
        taux_emploi_6_mois: 7,
        taux_poursuite_etudes: 8,
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
            code_certification: "12345678",
            millesime: "2018_2019",
            filiere: "apprentissage",
            diplome: { code: "4", libelle: "BAC" },
            nb_annee_term: 1,
            nb_en_emploi_12_mois: 2,
            nb_en_emploi_6_mois: 3,
            nb_poursuite_etudes: 4,
            nb_sortant: 5,
            taux_emploi_12_mois: 6,
            taux_emploi_6_mois: 7,
            taux_poursuite_etudes: 8,
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

    it("Vérifie qu'on peut obtenir les stats de formations pour code formation", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({ code_certification: "12345" });
      await insertFormationsStats({ code_certification: "67890" });

      const response = await httpClient.get(`/api/inserjeunes/formations?code_certifications=12345`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.formations[0].code_certification, "12345");
      assert.strictEqual(response.data.pagination.total, 1);
    });

    it("Vérifie qu'on peut exporter les données au format CSV", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018_2019",
        filiere: "apprentissage",
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 2,
        nb_en_emploi_6_mois: 3,
        nb_poursuite_etudes: 4,
        nb_sortant: 5,
        taux_emploi_12_mois: 6,
        taux_emploi_6_mois: 7,
        taux_poursuite_etudes: 8,
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
        `uai;code_certification;filiere;millesime;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_emploi_12_mois;taux_emploi_6_mois;taux_poursuite_etudes
0751234J;12345678;apprentissage;2018_2019;1;2;3;4;5;6;7;8
`
      );
    });

    it("Vérifie qu'on retourne une 404 si les paramètres sont invalides", async () => {
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
  });

  describe("Obtention", () => {
    it("Vérifie qu'on peut obtenir une formation", async () => {
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
        millesime: "2020_2021",
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 2,
        nb_en_emploi_6_mois: 3,
        nb_poursuite_etudes: 4,
        nb_sortant: 5,
        taux_emploi_12_mois: 6,
        taux_emploi_6_mois: 7,
        taux_poursuite_etudes: 8,
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data, {
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2020_2021",
        filiere: "apprentissage",
        diplome: { code: "4", libelle: "BAC" },
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 2,
        nb_en_emploi_6_mois: 3,
        nb_poursuite_etudes: 4,
        nb_sortant: 5,
        taux_emploi_12_mois: 6,
        taux_emploi_6_mois: 7,
        taux_poursuite_etudes: 8,
        _meta: {
          description:
            "Données InserJeunes pour la certification 12345678 (BAC filière apprentissage) dispensée par l'établissement 0751234J, pour le millesime 2020_2021",
          title: "certification 12345678, établissement 0751234J",
        },
      });
    });

    it("Vérifie qu'on peut obtenir une formation et un millesime", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2018_2019",
      });
      await insertFormationsStats({
        uai: "0751234J",
        code_certification: "12345678",
        millesime: "2020_2021",
      });

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2018_2019`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.data.millesime, "2018_2019");
    });

    it("Vérifie qu'on retourne une 404 si la formation est inconnue", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get(`/api/inserjeunes/formations/0751234J-INCONNUE`);

      assert.strictEqual(response.status, 404);
      assert.deepStrictEqual(response.data, {
        error: "Not Found",
        message: "Formation inconnue",
        statusCode: 404,
      });
    });
  });

  describe("Widget", () => {
    function createDefaultStats() {
      return insertFormationsStats({
        uai: "0751234J",
        code_certification: "1022105",
        taux_emploi_6_mois: 50,
      });
    }

    it("Vérifie qu'on peut obtenir une image SVG", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
      assert.ok(response.data.includes("<title>certification 1022105, établissement 0751234J</title>"));
      assert.ok(
        response.data.includes(
          "<desc>Données InserJeunes pour la certification 1022105 (BAC filière apprentissage) dispensée par l&#39;établissement 0751234J, pour le millesime 2018_2019</desc>"
        )
      );
    });

    it("Vérifie qu'on peut obtenir une image SVG horizontale", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg?direction=horizontal");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="700"`));
    });

    it("Vérifie qu'on peut obtenir une image SVG avec une seule donnée disponible (vertical)", async () => {
      const { httpClient } = await startServer();
      await formationsStats().insertOne({
        uai: "0751234J",
        code_certification: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="258"`));
    });

    it("Vérifie qu'on peut obtenir une image SVG avec une seule donnée disponible (horizontale)", async () => {
      const { httpClient } = await startServer();
      await formationsStats().insertOne({
        uai: "0751234J",
        code_certification: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg?direction=horizontal");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="700"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(!response.data.includes("poursuivent leurs études"));
    });

    it("Vérifie qu'on peut obtenir une image SVG avec une donnée égale à 0", async () => {
      const { httpClient } = await startServer();
      await formationsStats().insertOne({
        uai: "0751234J",
        code_certification: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
        taux_poursuite_etudes: 0,
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="323"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });

    it("Vérifie qu'on obtient une erreur quand la statistique n'existe pas", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get("/api/inserjeunes/formations/0751234P-1022101.svg");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data.message, "Formation inconnue");
    });

    it("Vérifie qu'on obtient une erreur quand il n'y a pas de données disponible pour la stats", async () => {
      const { httpClient } = await startServer();
      await formationsStats().insertOne({
        uai: "0751234J",
        code_certification: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
      });

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data, "Données statistiques non disponibles");
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

      const response = await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg?direction=diagonal");

      assert.strictEqual(response.status, 400);
      assert.strictEqual(response.data.message, "Erreur de validation");
    });
  });
});
