import * as chai from "chai";
import { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import MockDate from "mockdate";
import { omit } from "lodash-es";
import {
  insertBCNMEF,
  insertMEF,
  insertRegionalesStats,
  insertCertificationsStats,
  insertFormationsStats,
} from "#tests/utils/fakeData.js";
import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import { importAnneesNonTerminales } from "#src/jobs/stats/importAnneesNonTerminales.js";

chai.use(chaiAsPromised);

describe("importAnneesNonTerminales", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  const DEFAULT_STATS = {
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
    taux_rupture_contrats: 10,
  };

  describe("Au niveau certifications", () => {
    it("Vérifie que l'on ajoute les années non terminales pour une certification", async () => {
      await Promise.all([
        await insertMEF({
          code_certification: "32210000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32220000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32230000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        insertCertificationsStats({
          code_certification: "32230000000",
          code_formation_diplome: "32000000",
          filiere: "pro",
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importAnneesNonTerminales({ stats: "certifications" });
      assert.deepEqual(result, {
        created: 2,
        failed: 0,
        updated: 0,
      });

      const certificationPremiere = await CertificationStatsRepository.first({ code_certification: "32220000000" });
      assert.deepEqual(omit(certificationPremiere, "_id"), {
        code_certification: "32220000000",
        millesime: "2020",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32230000000" }],
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const certificationSeconde = await CertificationStatsRepository.first({ code_certification: "32210000000" });
      assert.deepEqual(omit(certificationSeconde, "_id"), {
        code_certification: "32210000000",
        millesime: "2020",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32230000000" }],
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
    });

    it("Vérifie que l'on ajoute les années non terminales ayant un mef disctontinu pour une certification", async () => {
      await Promise.all([
        await insertBCNMEF({
          mef_stat_11: "32219999999",
          formation_diplome: "32000000",
          annee_dispositif: "1",
        }),
        await insertMEF({
          code_certification: "32219999999",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32220000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        insertCertificationsStats({
          code_certification: "32220000000",
          code_formation_diplome: "32000000",
          filiere: "pro",
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importAnneesNonTerminales({ stats: "certifications" });
      assert.deepEqual(result, {
        created: 1,
        failed: 0,
        updated: 0,
      });

      const certificationSeconde = await CertificationStatsRepository.first({ code_certification: "32219999999" });
      assert.deepEqual(omit(certificationSeconde, "_id"), {
        code_certification: "32219999999",
        millesime: "2020",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32220000000" }],
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
    });
  });

  describe("Au niveau régionales", () => {
    it("Vérifie que l'on ajoute les années non terminales pour une certification", async () => {
      await Promise.all([
        await insertMEF({
          code_certification: "32210000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32220000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32230000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        insertRegionalesStats({
          code_certification: "32230000000",
          code_formation_diplome: "32000000",
          filiere: "pro",
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importAnneesNonTerminales({ stats: "regionales" });
      assert.deepEqual(result, {
        created: 2,
        failed: 0,
        updated: 0,
      });

      const certificationPremiere = await RegionaleStatsRepository.first({ code_certification: "32220000000" });
      assert.deepEqual(omit(certificationPremiere, "_id"), {
        code_certification: "32220000000",
        millesime: "2018_2019",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32230000000" }],
        region: {
          code: "11",
          nom: "Île-de-France",
        },
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const certificationSeconde = await RegionaleStatsRepository.first({ code_certification: "32210000000" });
      assert.deepEqual(omit(certificationSeconde, "_id"), {
        code_certification: "32210000000",
        millesime: "2018_2019",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32230000000" }],
        region: {
          code: "11",
          nom: "Île-de-France",
        },
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
    });
  });

  describe("Au niveau formations", () => {
    it("Vérifie que l'on ajoute les années non terminales pour une certification", async () => {
      await Promise.all([
        await insertMEF({
          code_certification: "32210000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32220000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        await insertMEF({
          code_certification: "32230000000",
          code_formation_diplome: "32000000",
          diplome: { code: "4", libelle: "BAC" },
        }),
        insertFormationsStats({
          uai: "0754247J",
          code_certification: "32230000000",
          code_formation_diplome: "32000000",
          filiere: "pro",
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importAnneesNonTerminales({ stats: "formations" });
      assert.deepEqual(result, {
        created: 2,
        failed: 0,
        updated: 0,
      });

      const certificationPremiere = await FormationStatsRepository.first({ code_certification: "32220000000" });
      assert.deepEqual(omit(certificationPremiere, "_id"), {
        uai: "0754247J",
        code_certification: "32220000000",
        millesime: "2018_2019",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32230000000" }],
        academie: {
          code: "01",
          nom: "Paris",
        },
        region: {
          code: "11",
          nom: "Île-de-France",
        },
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const certificationSeconde = await FormationStatsRepository.first({ code_certification: "32210000000" });
      assert.deepEqual(omit(certificationSeconde, "_id"), {
        uai: "0754247J",
        code_certification: "32210000000",
        millesime: "2018_2019",
        code_certification_type: "mef11",
        code_formation_diplome: "32000000",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "pro",
        libelle: "BAC PRO BATIMENT",
        certificationsTerminales: [{ code_certification: "32230000000" }],
        academie: {
          code: "01",
          nom: "Paris",
        },
        region: {
          code: "11",
          nom: "Île-de-France",
        },
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
    });
  });
});
