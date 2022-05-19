const assert = require("assert");
const { startServer } = require("../utils/testUtils");

describe("healthcheckRoutes", () => {
  it("Vérifie que le server fonctionne", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api/doc/");

    assert.strictEqual(response.status, 200);
    assert.ok(response.data.indexOf("swagger-ui.css") !== -1);
  });
});
