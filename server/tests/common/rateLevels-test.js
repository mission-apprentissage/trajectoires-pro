const assert = require("assert");
const { getRateLevel } = require("../../src/common/rateLevels");

describe("getRateLevel", () => {
  it("should get default rate level if key is not listed", () => {
    assert.deepStrictEqual(getRateLevel("any_key", 24, "pro", "CAP"), "danger");
    assert.deepStrictEqual(getRateLevel("any_key", 25, "pro", "CAP"), "warning");
    assert.deepStrictEqual(getRateLevel("any_key", 49, "pro", "CAP"), "warning");
    assert.deepStrictEqual(getRateLevel("any_key", 50, "pro", "CAP"), "success");
  });

  it("should get default rate level if filiere is not listed", () => {
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 24, "alternance", "CAP"), "danger");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 25, "alternance", "CAP"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 49, "alternance", "CAP"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 50, "alternance", "CAP"), "success");
  });

  it("should get default rate level if diplome is not listed", () => {
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 24, "pro", "TH-5"), "danger");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 25, "pro", "TH-5"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 49, "pro", "TH-5"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 50, "pro", "TH-5"), "success");
  });

  it("should get custom rate levels if listed", () => {
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 9, "pro", "CAP"), "danger");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 10, "pro", "CAP"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 49, "pro", "CAP"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 50, "pro", "CAP"), "success");

    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 34, "apprentissage", "BTS"), "danger");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 35, "apprentissage", "BTS"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 49, "apprentissage", "BTS"), "warning");
    assert.deepStrictEqual(getRateLevel("taux_emploi_6_mois", 50, "apprentissage", "BTS"), "success");
  });
});
