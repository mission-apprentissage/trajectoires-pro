const assert = require("assert");
const { startServer } = require("../utils/testUtils");

describe("helloRoute", () => {
  it("Vérifie que la route fonctionne", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api/helloRoute");

    assert.strictEqual(response.status, 200);
    assert.ok(response.data.message);
  });
});
