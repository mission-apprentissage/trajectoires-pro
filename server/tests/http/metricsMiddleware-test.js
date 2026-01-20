import { assert } from "chai";
import { startServer } from "#tests/utils/testUtils.js";
import {
  insertFormationsStats,
  insertCertificationsStats,
  insertCFD,
  insertRegionalesStats,
} from "#tests/utils/fakeData.js";
import { metrics } from "#src/common/db/collections/collections.js";
import config from "#src/config.js";

describe("metricsMiddleware", () => {
  function getAuthHeaders() {
    return {
      "x-api-key": config.inserJeunes.api.key,
    };
  }

  it("vérifie que l'on traque l'utilisation de l'API", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({
      uai: "0751234J",
      code_certification: "12345678",
      millesime: "2018_2019",
    });

    await httpClient.get(`/api/inserjeunes/formations/0751234J-12345678?millesime=2018_2019`);

    const results = await metrics().find({}).toArray();
    assert.strictEqual(results.length, 1);
    assert.deepInclude(results[0], {
      consumer: "127.0.0.1",
      url: "/api/inserjeunes/formations/0751234J-12345678?millesime=2018_2019",
      code_certification: "12345678",
      codes_certifications: ["12345678"],
      uai: "0751234J",
    });
  });

  it("vérifie que l'on remonte les codes de certifications dans les queries", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({
      code_certification: "12345678",
      millesime: "2018_2019",
    });

    await insertCertificationsStats({
      code_certification: "12345679",
      millesime: "2018_2019",
    });

    await httpClient.get(`/api/inserjeunes/certifications?code_certifications=12345678,12345679&millesimes=2018_2019`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    const results = await metrics().find({}).toArray();
    assert.strictEqual(results.length, 1);
    assert.deepInclude(results[0], {
      consumer: "127.0.0.1",
      url: `/api/inserjeunes/certifications?code_certifications=12345678,12345679&millesimes=2018_2019`,
      codes_certifications: ["12345678", "12345679"],
    });
  });

  describe("vérifie que l'on remonte les codes de certifications dans les parameters", async () => {
    it("pour plusieurs codes", async () => {
      const { httpClient } = await startServer();
      await insertCFD({
        code_certification: "12345678",
        code_formation_diplome: "12345",
      });

      await insertCFD({
        code_certification: "12345679",
        code_formation_diplome: "12345",
      });

      await insertCertificationsStats({
        code_certification: "12345678",
        code_formation_diplome: "12345",
        millesime: "2018_2019",
      });

      await insertCertificationsStats({
        code_certification: "12345679",
        code_formation_diplome: "12345",
        millesime: "2018_2019",
      });

      await httpClient.get(`/api/inserjeunes/certifications/12345678,12345679`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const results = await metrics().find({}).toArray();
      assert.strictEqual(results.length, 1);
      assert.deepInclude(results[0], {
        consumer: "127.0.0.1",
        url: `/api/inserjeunes/certifications/12345678,12345679`,
        codes_certifications: ["12345678", "12345679"],
      });
    });

    it("pour un seul code", async () => {
      const { httpClient } = await startServer();
      await insertCFD({
        code_certification: "12345678",
        code_formation_diplome: "12345",
      });

      await insertCertificationsStats({
        code_certification: "12345678",
        code_formation_diplome: "12345",
        millesime: "2018_2019",
      });

      await httpClient.get(`/api/inserjeunes/certifications/12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const results = await metrics().find({}).toArray();
      assert.strictEqual(results.length, 1);
      assert.deepInclude(results[0], {
        consumer: "127.0.0.1",
        url: `/api/inserjeunes/certifications/12345678`,
        codes_certifications: ["12345678"],
      });
    });
  });

  it("vérifie que l'on remonte le codes de region dans les parameters", async () => {
    const { httpClient } = await startServer();
    await insertCFD({
      code_certification: "12345678",
      code_formation_diplome: "12345",
    });

    await insertRegionalesStats({
      code_certification: "12345678",
      code_formation_diplome: "12345",
      millesime: "2018_2019",
    });

    await httpClient.get(`/api/inserjeunes/regionales/11/certifications/12345678`);

    const results = await metrics().find({}).toArray();
    assert.strictEqual(results.length, 1);
    assert.deepInclude(results[0], {
      consumer: "127.0.0.1",
      url: `/api/inserjeunes/regionales/11/certifications/12345678`,
      regions: ["11"],
    });
  });

  describe("vérifie que l'on remonte le codes de region dans les queries", async () => {
    it("pour une region", async () => {
      const { httpClient } = await startServer();

      await insertRegionalesStats({
        code_certification: "12345678",
        code_formation_diplome: "12345",
        millesime: "2018_2019",
      });

      await httpClient.get(`/api/inserjeunes/regionales?regions=11&code_certifications=12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const results = await metrics().find({}).toArray();
      assert.strictEqual(results.length, 1);
      assert.deepInclude(results[0], {
        consumer: "127.0.0.1",
        url: `/api/inserjeunes/regionales?regions=11&code_certifications=12345678`,
        regions: ["11"],
      });
    });

    it("pour plusieurs regions", async () => {
      const { httpClient } = await startServer();

      await insertRegionalesStats({
        code_certification: "12345678",
        code_formation_diplome: "12345",
        millesime: "2018_2019",
      });

      await insertRegionalesStats({
        code_certification: "12345678",
        code_formation_diplome: "12345",
        millesime: "2018_2019",
        region: { code: "84", nom: "Auvergne-Rhône-Alpes" },
      });

      await httpClient.get(`/api/inserjeunes/regionales?regions=11,84&code_certifications=12345678`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const results = await metrics().find({}).toArray();
      assert.strictEqual(results.length, 1);
      assert.deepInclude(results[0], {
        consumer: "127.0.0.1",
        url: `/api/inserjeunes/regionales?regions=11,84&code_certifications=12345678`,
        regions: ["11", "84"],
      });
    });
  });

  it("vérifie que l'on traque l'utilisation du widget", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({
      uai: "0751234J",
      code_certification: "1022105",
      taux_en_emploi_6_mois: 50,
    });

    await httpClient.get("/api/inserjeunes/formations/0751234J-1022105.svg");

    const results = await metrics().find({}).toArray();
    assert.strictEqual(results.length, 1);
    assert.deepInclude(results[0], {
      consumer: "127.0.0.1",
      extension: "svg",
      url: "/api/inserjeunes/formations/0751234J-1022105.svg",
      code_certification: "1022105",
      codes_certifications: ["1022105"],
      uai: "0751234J",
    });
  });
});
