import assert from "assert";
import {
  buildDescription,
  getStats,
  getStatsCompute,
  filterStatsNames,
  transformDisplayStat,
} from "#src/common/stats.js";

describe("statsNames", () => {
  it("Permet de lister le nom de stats", () => {
    const statsNames = filterStatsNames();
    assert.ok(statsNames.includes("nb_en_emploi_24_mois"));
    assert.ok(statsNames.includes("nb_sortant"));
    assert.ok(statsNames.includes("taux_en_emploi_24_mois"));
  });

  it("Permet de lister le nom de stats avec un prefix", () => {
    const statsNames = filterStatsNames(/^taux/);
    assert.ok(!statsNames.includes("nb_en_emploi_24_mois"));
  });

  describe("getStatsCompute", () => {
    it("Enlève les valeurs qui ne sont pas des nombres", () => {
      const statsNull = getStatsCompute(/^taux/, () => null);
      assert.deepStrictEqual(statsNull, {});

      const statsString = getStatsCompute(/^taux/, () => NaN);
      assert.deepStrictEqual(statsString, {});
    });

    it("Permet de filtrer et convertir les stats de type nombre en un objet", () => {
      const stats = getStatsCompute(/^taux/, () => 0);
      assert.deepStrictEqual(stats, {
        taux_en_emploi_12_mois: 0,
        taux_en_emploi_18_mois: 0,
        taux_en_emploi_24_mois: 0,
        taux_en_emploi_6_mois: 0,
        taux_en_formation: 0,
        taux_autres_6_mois: 0,
        taux_autres_12_mois: 0,
        taux_autres_18_mois: 0,
        taux_autres_24_mois: 0,
        taux_rupture_contrats: 0,
      });
    });
  });

  describe("getStats", () => {
    it("Enlève les valeurs manquantes", () => {
      const statsNull = getStats(/^taux/, () => null);
      assert.deepStrictEqual(statsNull, {});

      const statsZero = getStats(/^taux/, () => 0);
      assert.deepStrictEqual(statsZero, {});
    });

    it("Permet de filtrer et convertir les stats en un objet", () => {
      const stats = getStats(/^taux/, () => ({}));
      assert.deepStrictEqual(stats, {
        taux_en_emploi_12_mois: {},
        taux_en_emploi_18_mois: {},
        taux_en_emploi_24_mois: {},
        taux_en_emploi_6_mois: {},
        taux_en_formation: {},
        taux_autres_6_mois: {},
        taux_autres_12_mois: {},
        taux_autres_18_mois: {},
        taux_autres_24_mois: {},
        taux_rupture_contrats: {},
      });
    });
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

  describe("transformDisplayStat", () => {
    it("Met les taux à null quand les effectifs sont < 20", async () => {
      const data = {
        nb_annee_term: 10,
        taux_autres_12_mois: 0,
        taux_autres_18_mois: 0,
        taux_autres_24_mois: 0,
        taux_autres_6_mois: 0,
        taux_en_emploi_12_mois: 20,
        taux_en_emploi_18_mois: 20,
        taux_en_emploi_24_mois: 20,
        taux_en_emploi_6_mois: 20,
        taux_en_formation: 50,
      };
      const result = transformDisplayStat()(data);
      assert.deepStrictEqual(result, {
        nb_annee_term: 10,
        taux_autres_12_mois: null,
        taux_autres_18_mois: null,
        taux_autres_24_mois: null,
        taux_autres_6_mois: null,
        taux_en_emploi_12_mois: null,
        taux_en_emploi_18_mois: null,
        taux_en_emploi_24_mois: null,
        taux_en_emploi_6_mois: null,
        taux_en_formation: null,
        _meta: {
          messages: [
            `Les taux ne peuvent pas être affichés car il n'y a pas assez d'élèves pour fournir une information fiable.`,
          ],
        },
      });
    });

    it("Ne change pas les taux  quand les effectifs sont >= 20", async () => {
      const data = {
        nb_annee_term: 20,
        taux_autres_12_mois: 0,
        taux_autres_18_mois: 0,
        taux_autres_24_mois: 0,
        taux_autres_6_mois: 0,
        taux_en_emploi_12_mois: 20,
        taux_en_emploi_18_mois: 20,
        taux_en_emploi_24_mois: 20,
        taux_en_emploi_6_mois: 20,
        taux_en_formation: 50,
      };
      const result = transformDisplayStat()(data);
      assert.deepStrictEqual(result, {
        nb_annee_term: 20,
        taux_autres_12_mois: 0,
        taux_autres_18_mois: 0,
        taux_autres_24_mois: 0,
        taux_autres_6_mois: 0,
        taux_en_emploi_12_mois: 20,
        taux_en_emploi_18_mois: 20,
        taux_en_emploi_24_mois: 20,
        taux_en_emploi_6_mois: 20,
        taux_en_formation: 50,
      });
    });
  });
});
