import assert from "assert";
import { getStatsNames } from "../../src/common/stats/statsNames.js";

describe("statsNames", () => {
  it("Permet de lister le nom de stats", () => {
    const statsNames = getStatsNames();
    assert.ok(statsNames.includes("nb_en_emploi_24_mois"));
    assert.ok(statsNames.includes("nb_sortant"));
    assert.ok(statsNames.includes("taux_emploi_24_mois"));
  });

  it("Permet de lister le nom de stats avec un prefix", () => {
    const statsNames = getStatsNames({ prefix: "taux" });
    assert.ok(!statsNames.includes("nb_en_emploi_24_mois"));
  });
});
