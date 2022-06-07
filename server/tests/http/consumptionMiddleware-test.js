import assert from "assert";
import { startServer } from "../utils/testUtils.js";
import { insertFormationsStats } from "../utils/fakeData.js";
import { consumptions } from "../../src/common/collections/collections.js";

describe("consumptionMiddleware", () => {
  it("checks that we track usage of the api", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({
      uai: "0751234J",
      code_certification: "12345678",
      millesime: "2018_2019",
    });

    await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2018_2019`);

    const results = await consumptions()
      .find({}, { projection: { _id: 0, consumer: 1, url: 1, extension: 1 } })
      .toArray();
    assert.strictEqual(results.length, 1);
    assert.deepStrictEqual(results[0], {
      consumer: "127.0.0.1",
      url: "/api/inserjeunes/formations/0751234J-12345678?millesime=2018_2019",
    });
  });

  it("checks that we track usage of the widget", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({
      uai: "0751234J",
      code_certification: "1022105",
      taux_emploi_6_mois: 50,
    });

    await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg");

    const results = await consumptions()
      .find({}, { projection: { _id: 0, consumer: 1, url: 1, extension: 1 } })
      .toArray();
    assert.strictEqual(results.length, 1);
    assert.deepStrictEqual(results[0], {
      consumer: "127.0.0.1",
      extension: "svg",
      url: "/api/inserjeunes/formations/0751234J-1022105.svg",
    });
  });
});
