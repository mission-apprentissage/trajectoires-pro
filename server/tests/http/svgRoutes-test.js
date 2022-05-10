const assert = require("assert");
const { startServer } = require("../utils/testUtils");
const { dbCollection } = require("../../src/common/mongodb");
const { inserInserJeunesEtablissements } = require("../utils/fakeData");

describe("svgRoutes", () => {
  beforeEach(async () => {
    await inserInserJeunesEtablissements({
      taux_emploi_6_mois_apres_la_sortie: 50,
    });
  });

  it("should return a svg file if data exist", async () => {
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/uai/0751234J/code_formation/1022105/millesime/2022-2021");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes("50%"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
    assert.ok(response.data.includes("poursuivent leurs études"));
  });

  it("should get the horizontal file if asked", async () => {
    const { httpClient } = await startServer();
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
    await dbCollection("inserJeunesEtablissements").insertOne({
      millesime: "2022-2021",
      code_formation: "1022105",
      type: "apprentissage",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 1,
      libelle_de_etablissement: "Centre de Formation",
      libelle_de_la_formation: "cuisinier en desserts de restaurant",
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      taux_emploi_12_mois_apres_la_sortie: 58,
      taux_emploi_6_mois_apres_la_sortie: 50,
      type_de_diplome: "MC5",
      uai_de_etablissement: "0751234K",
    });
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/uai/0751234K/code_formation/1022105/millesime/2022-2021");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes(`width="320"`));
    assert.ok(response.data.includes(`height="268"`));
    assert.ok(response.data.includes("50%"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
    assert.ok(!response.data.includes("poursuivent leurs études"));
  });

  it("should display only one data if present - horizontal", async () => {
    await dbCollection("inserJeunesEtablissements").insertOne({
      millesime: "2022-2021",
      code_formation: "1022105",
      type: "apprentissage",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 1,
      libelle_de_etablissement: "Centre de Formation",
      libelle_de_la_formation: "cuisinier en desserts de restaurant",
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      taux_emploi_12_mois_apres_la_sortie: 58,
      taux_emploi_6_mois_apres_la_sortie: 50,
      type_de_diplome: "MC5",
      uai_de_etablissement: "0751234K",
    });
    const { httpClient } = await startServer();
    const response = await httpClient.get(
      "/api/svg/uai/0751234K/code_formation/1022105/millesime/2022-2021?direction=horizontal"
    );

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes(`width="585"`));
    assert.ok(response.data.includes("50%"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
    assert.ok(!response.data.includes("poursuivent leurs études"));
  });

  it("should display data if value is 0", async () => {
    await dbCollection("inserJeunesEtablissements").insertOne({
      millesime: "2022-2021",
      code_formation: "1022105",
      type: "apprentissage",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 1,
      libelle_de_etablissement: "Centre de Formation",
      libelle_de_la_formation: "cuisinier en desserts de restaurant",
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      taux_de_poursuite_etudes: 0,
      taux_emploi_12_mois_apres_la_sortie: 58,
      taux_emploi_6_mois_apres_la_sortie: 50,
      type_de_diplome: "MC5",
      uai_de_etablissement: "0751234K",
    });
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/uai/0751234K/code_formation/1022105/millesime/2022-2021");

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
    await dbCollection("inserJeunesEtablissements").insertOne({
      millesime: "2022-2021",
      code_formation: "1022106",
      type: "apprentissage",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 1,
      libelle_de_etablissement: "Centre de Formation",
      libelle_de_la_formation: "cuisinier en desserts de restaurant",
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      type_de_diplome: "MC5",
      uai_de_etablissement: "0751234K",
    });
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/uai/0751234K/code_formation/1022106/millesime/2022-2021");
    assert.strictEqual(response.status, 404);
    assert.strictEqual(response.data, "Donnée non disponible");
  });

  it("should return a 400 if uai is not well formated", async () => {
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/uai/0010001/code_formation/23220023440/millesime/2020-2019");
    assert.strictEqual(response.status, 400);
  });
});
