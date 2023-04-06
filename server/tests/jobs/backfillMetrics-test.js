import { assert } from "chai";
import { insertMetrics } from "../utils/fakeData.js";
import { metrics } from "../../src/common/db/collections/collections.js";
import { backfillMetrics } from "../../src/jobs/backfillMetrics.js";

describe("backfillMetrics", () => {
  describe("Vérifie qu'on met à jour les champs manquants dans les metrics", async () => {
    describe("route formations", async () => {
      it("simple", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/formations/0751234J-12345678",
          uai: "0751234J",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/formations/0751234J-12345678",
          code_certification: "12345678",
          codes_certifications: ["12345678"],
          uai: "0751234J",
        });
        assert.notProperty(results[0], "regions");
      });

      it("widget", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/formations/0751234J-12345678.svg",
          uai: "0751234J",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/formations/0751234J-12345678.svg",
          code_certification: "12345678",
          codes_certifications: ["12345678"],
          uai: "0751234J",
        });
        assert.notProperty(results[0], "regions");
      });

      it("multiple avec région", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/formations?regions=11&code_certifications=12345678%2C12345679&items_par_page=10",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/formations?regions=11&code_certifications=12345678%2C12345679&items_par_page=10",
          codes_certifications: ["12345678", "12345679"],
          regions: ["11"],
        });
      });
    });

    describe("route certifications", async () => {
      it("simple", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/certifications/46033203",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/certifications/46033203",
          codes_certifications: ["46033203"],
        });
        assert.notProperty(results[0], "regions");
      });

      it("paramètre multiple", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/certifications/23110025136,23220025136|50025136",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/certifications/23110025136,23220025136|50025136",
          codes_certifications: ["23110025136", "23220025136", "50025136"],
        });
        assert.notProperty(results[0], "regions");
      });

      it("query multiple", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/certifications?code_certifications=23110025136,23220025136|50025136",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/certifications?code_certifications=23110025136,23220025136|50025136",
          codes_certifications: ["23110025136", "23220025136", "50025136"],
        });
        assert.notProperty(results[0], "regions");
      });
    });

    describe("route regionales", async () => {
      it("simple", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/regionales/11",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/regionales/11",
          regions: ["11"],
        });
        assert.notProperty(results[0], "codes_certifications");
      });

      it("simple avec code de certifications", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/regionales/11/certifications/12345678",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/regionales/11/certifications/12345678",
          codes_certifications: ["12345678"],
          regions: ["11"],
        });
      });

      it("multiple", async () => {
        await insertMetrics({
          url: "/api/inserjeunes/regionales?regions=11%2C84&code_certifications=1234%2C1235",
        });

        await backfillMetrics();

        const results = await metrics().find({}).toArray();
        assert.strictEqual(results.length, 1);
        assert.deepInclude(results[0], {
          consumer: "localhost",
          url: "/api/inserjeunes/regionales?regions=11%2C84&code_certifications=1234%2C1235",
          codes_certifications: ["1234", "1235"],
          regions: ["11", "84"],
        });
      });
    });
  });
});
