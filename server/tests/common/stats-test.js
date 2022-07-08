import assert from "assert";
import { buildDescription, getStatsNames } from "../../src/common/stats/stats.js";

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

  it("Permet de construire une description pour une stats formation", () => {
    const description = buildDescription({
      code_certification: "12345",
      filiere: "pro",
      uai: "0751234J",
      millesime: "2019",
      diplome: { code: "4", libelle: "BAC" },
    });

    assert.deepStrictEqual(description, {
      titre: "Certification 12345, établissement 0751234J",
      details:
        "Données InserJeunes pour la certification 12345 (BAC filière pro) dispensée par l'établissement 0751234J, pour le millesime 2019",
    });
  });

  it("Permet de construire une description pour une stats certification", () => {
    const description = buildDescription({
      code_certification: "12345",
      filiere: "pro",
      millesime: "2019",
      diplome: { code: "4", libelle: "BAC" },
    });

    assert.deepStrictEqual(description, {
      titre: "Certification 12345",
      details: "Données InserJeunes pour la certification 12345 (BAC filière pro) pour le millesime 2019",
    });
  });
});
