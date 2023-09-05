import assert from "assert";
import { startServer } from "#tests/utils/testUtils.js";

describe("healthcheckRoutes", () => {
  it("Vérifie que le server fonctionne", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get("/api/doc/");

    assert.strictEqual(response.status, 200);
    assert.ok(response.data.includes("swagger-ui.css"));
  });
});
