import assert from "assert";
import { startServer } from "../utils/testUtils.js";
import { dbCollection } from "../../src/common/mongodb.js";
import { insertFormationsStats, insertCertificationsStats } from "../utils/fakeData.js";
import { formationsStats } from "../../src/common/collections/formationsStats.js";

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
      await formationsStats().insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
        taux_emploi_6_mois: 50,
      });

      const response = await httpClient.get("/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="268"`));
    });

    it("should display only one data if present - horizontal", async () => {
      const { httpClient } = await startServer();
      await formationsStats().insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
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
      await formationsStats().insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
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
      await formationsStats().insertOne({
        uai: "0751234J",
        code_formation: "1022105",
        diplome: { code: "4", libelle: "BAC" },
        millesime: "2021_2022",
        filiere: "apprentissage",
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
      const { httpClient } = await startServer();
      await insertCertificationsStats({
        millesime: "2020",
        code_formation: "23830024203",
        filiere: "apprentissage",
        taux_poursuite_etudes: 5,
      });

      const response = await httpClient.get("/api/svg/code_formation/23830024203/millesime/2020");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes("5%"));
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
      const { httpClient } = await startServer();
      await dbCollection("certificationsStats").insertOne({
        code_formation: "23830024203",
        millesime: "2018",
        filiere: "apprentissage",
        diplome: { code: "4", libelle: "BAC" },
      });
      const response = await httpClient.get("/api/svg/code_formation/23830024203/millesime/2018");

      assert.strictEqual(response.status, 404);
      assert.strictEqual(response.data, "Donnée non disponible");
    });

    it("should get the vertical file if asked direction is not list", async () => {
      await insertCertificationsStats({ code_formation: "23830024203", millesime: "2018" });
      const { httpClient } = await startServer();

      const response = await httpClient.get("/api/svg/code_formation/23830024203/millesime/2018?direction=diagonal");

      assert.strictEqual(response.status, 200);
      assert.ok(response.headers["content-type"].includes("image/svg+xml"));
      assert.ok(response.data.includes(`width="320"`));
      assert.ok(response.data.includes(`height="323"`));
    });
  });
});
