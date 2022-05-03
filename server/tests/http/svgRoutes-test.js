const assert = require("assert");
const { startServer } = require("../utils/testUtils");

describe("svgRoutes", () => {
  it("Vérifie que la route fonctionne", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api/svg/etablissement/123");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes("sont en emploi 6 mois"));
  });
});
