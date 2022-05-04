const assert = require("assert");
const { startServer } = require("../utils/testUtils");

const { insertInsertJeunes } = require("../utils/fakeData");

describe("svgRoutes", () => {
  beforeEach(async () => {
    await insertInsertJeunes({
      taux_emploi_6_mois_apres_la_sortie: 50,
    });
  });

  it("should return a svg file if data exist", async () => {
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/etablissement/0751234J/1022105/2022-2021");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes("50%"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
  });

  it("should get the horizontal file if asked", async () => {
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/etablissement/0751234J/1022105/2022-2021?direction=horizontal");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes(`width="700"`));
    assert.ok(response.data.includes("50%"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
  });

  it("should get the vertical file if asked direction is not list", async () => {
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/etablissement/0751234J/1022105/2022-2021?direction=diagonal");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes(`width="320"`));
    assert.ok(response.data.includes("50%"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
  });

  it("should return a 404 if data does not exist", async () => {
    const { httpClient } = await startServer();
    const response = await httpClient.get("/api/svg/etablissement/0751234P/1022101/2022-2021");
    assert.strictEqual(response.status, 404);
  });
});
