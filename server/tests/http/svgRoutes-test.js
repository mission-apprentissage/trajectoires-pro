const assert = require("assert");
const { startServer } = require("../utils/testUtils");
const { dbCollection } = require("../../src/common/mongodb");
const { insertFormationsStats } = require("../utils/fakeData");

describe("svgRoutes", () => {
  describe("formation", () => {
    function createDefaultStats() {
      return insertFormationsStats({
        uai: "0751234J",
        code_formation: "1022105",
        millesime: "2021_2022",
        taux_emploi_6_mois: 50,
      });
    }

    it("should return a svg file if data exist", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get("/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });

    it("should get the horizontal file if asked", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get(
        "/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021?direction=horizontal"
      );

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="700"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });

    it("should get the vertical file if asked direction is not list", async () => {
      const { httpClient } = await startServer();
      await createDefaultStats();

      const response = await httpClient.get(
        "/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021?direction=diagonal"
      );

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="323"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });

    it("should display only one data if present - vertical", async () => {
      const { httpClient } = await startServer();
      await dbCollection("formationsStats").insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        millesime: "2021_2022",
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get("/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="268"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(!response.data.includes("poursuivent leurs études"));
    });

    it("should display only one data if present - horizontal", async () => {
      const { httpClient } = await startServer();
      await dbCollection("formationsStats").insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        millesime: "2021_2022",
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get(
        "/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021?direction=horizontal"
      );

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="585"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(!response.data.includes("poursuivent leurs études"));
    });

    it("should display data if value is 0", async () => {
      const { httpClient } = await startServer();
      await insertFormationsStats({
        uai: "0751234J",
        code_formation: "1022105",
        millesime: "2021_2022",
        taux_poursuite_etudes: 0,
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get("/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="323"`));
      assert.ok(response.data.includes("50%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });

    it("should return a 404 if data does not exist", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.get("/api/svg/uai/0751234P/code_formation/1022101/millesime/2022-2021");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data, "UAI, code formation et/ou millésime invalide");
    });

    it("should return a 404 if data exists but rates are empty", async () => {
      const { httpClient } = await startServer();
      await dbCollection("formationsStats").insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        millesime: "2021_2022",
      });

      const response = await httpClient.get("/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data, "Donnée non disponible");
    });

    it("should return a 400 if uai is not well formated", async () => {
      const { httpClient } = await startServer();
      const response = await httpClient.get("/api/svg/uai/0010001/code_formation/23220023440/millesime/2020-2019");
      assert.strictEqual(response.status, 400);
    });
  });

  describe("certification", () => {
    it("should display svg for certification", async () => {
      await dbCollection("inserJeunesNationals").insertOne({
        code_formation: "23830024203",
        millesime: "2019_2020",
        libelle_de_la_formation: "metiers de la mode - vêtement",
        nb_en_annee_terminale: 2845,
        nb_en_emploi_12_mois_apres_la_sortie: 427,
        nb_en_emploi_6_mois_apres_la_sortie: 260,
        nb_en_poursuite_etudes: 1567,
        nb_sortants_6_mois_apres_la_sortie: 1278,
        taux_de_poursuite_etudes: 55,
        taux_emploi_12_mois_apres_la_sortie: 33,
        taux_emploi_6_mois_apres_la_sortie: 20,
        type: "pro",
        type_de_diplome: "BAC PRO",
        diplome_renove_ou_nouveau: "non",
      });
      const { httpClient } = await startServer();
      const response = await httpClient.get("/api/svg/code_formation/23830024203/millesime/2020-2019");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes("20%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });

    it("should return a 404 if data does not exist", async () => {
      const { httpClient } = await startServer();
      const response = await httpClient.get("/api/svg/code_formation/23830024203/millesime/2022-2021");
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data, "Code formation et/ou millésime invalide");
    });

    it("should return a 404 if data exists but rates are empty", async () => {
      await dbCollection("inserJeunesNationals").insertOne({
        code_formation: "23830024203",
        millesime: "2019_2020",
        libelle_de_la_formation: "metiers de la mode - vêtement",
        nb_en_annee_terminale: 2845,
        nb_en_emploi_12_mois_apres_la_sortie: 427,
        nb_en_emploi_6_mois_apres_la_sortie: 260,
        nb_en_poursuite_etudes: 1567,
        nb_sortants_6_mois_apres_la_sortie: 1278,
        taux_emploi_12_mois_apres_la_sortie: 33,
        type: "pro",
        type_de_diplome: "BAC PRO",
        diplome_renove_ou_nouveau: "non",
      });

      const { httpClient } = await startServer();
      const response = await httpClient.get("/api/svg/code_formation/23830024203/millesime/2020-2019");
      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data, "Donnée non disponible");
    });

    it("should get the vertical file if asked direction is not list", async () => {
      await dbCollection("inserJeunesNationals").insertOne({
        code_formation: "23830024203",
        millesime: "2019_2020",
        libelle_de_la_formation: "metiers de la mode - vêtement",
        nb_en_annee_terminale: 2845,
        nb_en_emploi_12_mois_apres_la_sortie: 427,
        nb_en_emploi_6_mois_apres_la_sortie: 260,
        nb_en_poursuite_etudes: 1567,
        nb_sortants_6_mois_apres_la_sortie: 1278,
        taux_de_poursuite_etudes: 55,
        taux_emploi_12_mois_apres_la_sortie: 33,
        taux_emploi_6_mois_apres_la_sortie: 20,
        type: "pro",
        type_de_diplome: "BAC PRO",
        diplome_renove_ou_nouveau: "non",
      });
      const { httpClient } = await startServer();
      const response = await httpClient.get(
        "/api/svg/code_formation/23830024203/millesime/2020-2019?direction=diagonal"
      );

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="323"`));
      assert.ok(response.data.includes("20%"));
      assert.ok(response.data.includes("sont en emploi 6 mois"));
      assert.ok(response.data.includes("poursuivent leurs études"));
    });
  });
});
