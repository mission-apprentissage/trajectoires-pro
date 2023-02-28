import assert from "assert";
import {
  buildDescription,
  getStats,
  getStatsCompute,
  filterStatsNames,
  getFilieresStats,
  transformDisplayStat,
} from "../../src/common/stats.js";

import { regionalesStats } from "../../src/common/db/collections/collections.js";

import { insertCFD, insertMEF, insertRegionalesStats } from "../utils/fakeData.js";

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

  describe("getFilieresStats", () => {
    it("Retourne les stats pour une filière", async () => {
      insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
      insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        millesime: "2020",
        nb_sortant: 45,
        nb_annee_term: 50,
        nb_poursuite_etudes: 5,
        nb_en_emploi_24_mois: 25,
        nb_en_emploi_18_mois: 25,
        nb_en_emploi_12_mois: 25,
        nb_en_emploi_6_mois: 45,
      });
      insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" });
      insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "23830024202",
        code_formation_diplome: "12345678",
        filiere: "pro",
        millesime: "2020",
        nb_sortant: 45,
        nb_annee_term: 50,
        nb_poursuite_etudes: 5,
        nb_en_emploi_24_mois: 25,
        nb_en_emploi_18_mois: 25,
        nb_en_emploi_12_mois: 25,
        nb_en_emploi_6_mois: 45,
      });

      const result = await getFilieresStats(regionalesStats(), "12345678", "2020");
      assert.deepStrictEqual(result, {
        pro: {
          codes_certifications: ["23830024202"],
          code_formation_diplome: "12345678",
          filiere: "pro",
          millesime: "2020",
          diplome: { code: "4", libelle: "BAC" },
          nb_annee_term: 50,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_6_mois: 45,
          nb_poursuite_etudes: 5,
          nb_sortant: 45,
          taux_autres_12_mois: 40,
          taux_autres_18_mois: 40,
          taux_autres_24_mois: 40,
          taux_autres_6_mois: 0,
          taux_en_emploi_12_mois: 50,
          taux_en_emploi_18_mois: 50,
          taux_en_emploi_24_mois: 50,
          taux_en_emploi_6_mois: 90,
          taux_en_formation: 10,
        },
        apprentissage: {
          codes_certifications: ["12345678"],
          code_formation_diplome: "12345678",
          filiere: "apprentissage",
          millesime: "2020",
          diplome: { code: "4", libelle: "BAC" },
          nb_annee_term: 50,
          nb_en_emploi_12_mois: 25,
          nb_en_emploi_18_mois: 25,
          nb_en_emploi_24_mois: 25,
          nb_en_emploi_6_mois: 45,
          nb_poursuite_etudes: 5,
          nb_sortant: 45,
          taux_autres_12_mois: 40,
          taux_autres_18_mois: 40,
          taux_autres_24_mois: 40,
          taux_autres_6_mois: 0,
          taux_en_emploi_12_mois: 50,
          taux_en_emploi_18_mois: 50,
          taux_en_emploi_24_mois: 50,
          taux_en_emploi_6_mois: 90,
          taux_en_formation: 10,
        },
      });
    });

    it("Met les taux à null quand les effectifs sont < 20", async () => {
      insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
      insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        filiere: "apprentissage",
        millesime: "2020",
        nb_annee_term: 10,
        nb_en_emploi_12_mois: 2,
        nb_en_emploi_18_mois: 2,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_6_mois: 2,
        nb_poursuite_etudes: 5,
        nb_sortant: 5,
      });
      insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" });
      insertRegionalesStats({
        region: { code: "11", nom: "Île-de-France" },
        code_certification: "23830024202",
        code_formation_diplome: "12345678",
        filiere: "pro",
        millesime: "2020",
        nb_annee_term: 10,
        nb_en_emploi_12_mois: 2,
        nb_en_emploi_18_mois: 2,
        nb_en_emploi_24_mois: 2,
        nb_en_emploi_6_mois: 2,
        nb_poursuite_etudes: 5,
        nb_sortant: 5,
      });

      const result = await getFilieresStats(regionalesStats(), "12345678", "2020");
      assert.deepStrictEqual(result, {
        pro: {
          codes_certifications: ["23830024202"],
          code_formation_diplome: "12345678",
          filiere: "pro",
          millesime: "2020",
          diplome: { code: "4", libelle: "BAC" },
          nb_annee_term: 10,
          nb_en_emploi_12_mois: 2,
          nb_en_emploi_18_mois: 2,
          nb_en_emploi_24_mois: 2,
          nb_en_emploi_6_mois: 2,
          nb_poursuite_etudes: 5,
          nb_sortant: 5,
          taux_autres_12_mois: null,
          taux_autres_18_mois: null,
          taux_autres_24_mois: null,
          taux_autres_6_mois: null,
          taux_en_emploi_12_mois: null,
          taux_en_emploi_18_mois: null,
          taux_en_emploi_24_mois: null,
          taux_en_emploi_6_mois: null,
          taux_en_formation: null,
        },
        apprentissage: {
          codes_certifications: ["12345678"],
          code_formation_diplome: "12345678",
          filiere: "apprentissage",
          millesime: "2020",
          diplome: { code: "4", libelle: "BAC" },
          nb_annee_term: 10,
          nb_en_emploi_12_mois: 2,
          nb_en_emploi_18_mois: 2,
          nb_en_emploi_24_mois: 2,
          nb_en_emploi_6_mois: 2,
          nb_poursuite_etudes: 5,
          nb_sortant: 5,
          taux_autres_12_mois: null,
          taux_autres_18_mois: null,
          taux_autres_24_mois: null,
          taux_autres_6_mois: null,
          taux_en_emploi_12_mois: null,
          taux_en_emploi_18_mois: null,
          taux_en_emploi_24_mois: null,
          taux_en_emploi_6_mois: null,
          taux_en_formation: null,
        },
      });
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
