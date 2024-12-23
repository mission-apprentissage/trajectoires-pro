import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import MockDate from "mockdate";
import { omit } from "lodash-es";
import {
  insertMEF,
  insertRegionalesStats,
  insertCertificationsStats,
  insertFormationsStats,
} from "#tests/utils/fakeData.js";
import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import { importSecondeCommune } from "#src/jobs/stats/importSecondeCommune.js";

chai.use(chaiAsPromised);

describe("importSecondeCommune", () => {
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
    it("Vérifie que l'on ajoute la seconde commune pour les certifications dans une famille de métier", async () => {
      await Promise.all([
        insertMEF({
          code_certification: "23810031211",
          code_formation_diplome: "40031211",
          libelle_long: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: true },
        }),
        insertMEF({
          code_certification: "23830031212",
          code_formation_diplome: "40031212",
          libelle_long: "TLEPRO METIERS DE L'ACCUEIL",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
        }),
        insertMEF({
          code_certification: "23830031213",
          code_formation_diplome: "40031213",
          libelle_long: "TLEPRO MET.COM.VEN.OP.A ANI.GES.ESP.COM. ",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
        }),
        insertCertificationsStats({
          code_certification: "23830031212",
          code_formation_diplome: "40031212",
          filiere: "pro",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
          ...DEFAULT_STATS,
        }),
        insertCertificationsStats({
          code_certification: "23830031213",
          code_formation_diplome: "40031213",
          filiere: "pro",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importSecondeCommune({ stats: "certifications" });
      assert.deepEqual(result, {
        created: 1,
        failed: 0,
        updated: 0,
      });

      const certification = await CertificationStatsRepository.first({ code_certification: "23810031211" });
      assert.deepEqual(omit(certification, ["_id", "certificationsTerminales"]), {
        code_certification: "23810031211",
        millesime: "2020",
        code_certification_type: "mef11",
        code_formation_diplome: "40031211",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: true },
        filiere: "pro",
        libelle: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
      assert.sameDeepMembers(certification.certificationsTerminales, [
        {
          code_certification: "23830031212",
        },
        {
          code_certification: "23830031213",
        },
      ]);
    });
  });

  describe("Au niveau régionales", () => {
    it("Vérifie que l'on ajoute la seconde commune pour les certifications dans une famille de métier", async () => {
      await Promise.all([
        insertMEF({
          code_certification: "23810031211",
          code_formation_diplome: "40031211",
          libelle_long: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: true },
        }),
        insertMEF({
          code_certification: "23830031212",
          code_formation_diplome: "40031212",
          libelle_long: "TLEPRO METIERS DE L'ACCUEIL",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
        }),
        insertMEF({
          code_certification: "23830031213",
          code_formation_diplome: "40031213",
          libelle_long: "TLEPRO MET.COM.VEN.OP.A ANI.GES.ESP.COM. ",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
        }),
        insertRegionalesStats({
          code_certification: "23830031212",
          code_formation_diplome: "40031212",
          filiere: "pro",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
          ...DEFAULT_STATS,
        }),
        insertRegionalesStats({
          code_certification: "23830031213",
          code_formation_diplome: "40031213",
          filiere: "pro",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importSecondeCommune({ stats: "regionales" });
      assert.deepEqual(result, {
        created: 1,
        failed: 0,
        updated: 0,
      });

      const certification = await RegionaleStatsRepository.first({ code_certification: "23810031211" });
      assert.deepEqual(omit(certification, "_id"), {
        code_certification: "23810031211",
        millesime: "2018_2019",
        code_certification_type: "mef11",
        code_formation_diplome: "40031211",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: true },
        filiere: "pro",
        libelle: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
        certificationsTerminales: [
          {
            code_certification: "23830031212",
          },
          {
            code_certification: "23830031213",
          },
        ],
        region: {
          code: "11",
          code_region_academique: "10",
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
    it("Vérifie que l'on ajoute la seconde commune pour les certifications dans une famille de métier", async () => {
      await Promise.all([
        insertMEF({
          code_certification: "23810031211",
          code_formation_diplome: "40031211",
          libelle_long: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: true },
        }),
        insertMEF({
          code_certification: "23830031212",
          code_formation_diplome: "40031212",
          libelle_long: "TLEPRO METIERS DE L'ACCUEIL",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
        }),
        insertMEF({
          code_certification: "23830031213",
          code_formation_diplome: "40031213",
          libelle_long: "TLEPRO MET.COM.VEN.OP.A ANI.GES.ESP.COM. ",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
        }),
        insertFormationsStats({
          uai: "01234567",
          code_certification: "23830031212",
          code_formation_diplome: "40031212",
          filiere: "pro",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
          ...DEFAULT_STATS,
        }),
        insertFormationsStats({
          uai: "01234567",
          code_certification: "23830031213",
          code_formation_diplome: "40031213",
          filiere: "pro",
          familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: false },
          ...DEFAULT_STATS,
        }),
      ]);

      const result = await importSecondeCommune({ stats: "formations" });
      assert.deepEqual(result, {
        created: 1,
        failed: 0,
        updated: 0,
      });

      const certification = await FormationStatsRepository.first({ code_certification: "23810031211" });
      assert.deepEqual(omit(certification, "_id"), {
        uai: "01234567",
        code_certification: "23810031211",
        millesime: "2018_2019",
        code_certification_type: "mef11",
        code_formation_diplome: "40031211",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        familleMetier: { code: "003", libelle: "RELATION CLIENT", isAnneeCommune: true },
        filiere: "pro",
        libelle: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
        certificationsTerminales: [
          {
            code_certification: "23830031212",
          },
          {
            code_certification: "23830031213",
          },
        ],
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
