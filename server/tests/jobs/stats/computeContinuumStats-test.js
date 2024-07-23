import assert from "assert";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import { computeContinuumStats } from "#src/jobs/stats/computeContinuumStats.js";
import {
  insertCFD,
  insertFormationsStats,
  insertCertificationsStats,
  insertRegionalesStats,
} from "#tests/utils/fakeData.js";
import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";

describe("computeContinuumStats", () => {
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

  const DEFAULT_STATS_VARIANT = {
    nb_annee_term: 20,
    nb_en_emploi_12_mois: 10,
    nb_en_emploi_18_mois: 10,
    nb_en_emploi_24_mois: 10,
    nb_en_emploi_6_mois: 10,
    nb_poursuite_etudes: 5,
    nb_sortant: 10,
    taux_autres_12_mois: 25,
    taux_autres_18_mois: 25,
    taux_autres_24_mois: 25,
    taux_autres_6_mois: 25,
    taux_en_emploi_12_mois: 50,
    taux_en_emploi_18_mois: 50,
    taux_en_emploi_24_mois: 50,
    taux_en_emploi_6_mois: 50,
    taux_en_formation: 25,
    taux_rupture_contrats: 10,
  };

  describe("Certifications", () => {
    describe("Pour les nouveaux diplomes avec un seul parent", () => {
      it("Récupère les données lorsque son parent n'a qu'un enfant", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT",
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU",
          }),
          insertCertificationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            ...DEFAULT_STATS,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const newDiplome = await CertificationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(newDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT NOUVEAU",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          donnee_source: {
            code_certification: "10000001",
            type: "ancienne",
          },
          filiere: "apprentissage",
          millesime: "2020",
          ...DEFAULT_STATS,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Ne récupère pas les données lorsque son parent à plusieurs enfants", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002", "10000003"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertCertificationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await CertificationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(newDiplome, null);
      });

      it("N'écrase pas les données si elles existent deja", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT",
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU",
          }),
          insertCertificationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            libelle: "BAC PRO BATIMENT",
            ...DEFAULT_STATS,
          }),
          insertCertificationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            libelle: "BAC PRO BATIMENT NOUVEAU",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await CertificationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(newDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT NOUVEAU",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          donnee_source: {
            code_certification: "10000002",
            type: "self",
          },
          filiere: "apprentissage",
          millesime: "2020",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    describe("Pour les nouveaux diplomes avec plusieurs parents", () => {
      it("Ne récupère pas les données", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001", "10000000"],
          }),
          insertCertificationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await CertificationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(newDiplome, null);
      });
    });

    describe("Pour les anciens diplomes avec un seul enfant", () => {
      it("Récupère les données lorsque son enfant n'a qu'un parent", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT",
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU",
          }),
          insertCertificationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ...DEFAULT_STATS,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const oldDiplome = await CertificationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          donnee_source: {
            code_certification: "10000002",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2020",
          ...DEFAULT_STATS,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Récupère les données de l'enfant le plus récent (dernier en chaine 1 <=> 1", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT",
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            nouveau_diplome: ["10000003"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU",
          }),
          insertCFD({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ancien_diplome: ["10000002"],
            nouveau_diplome: ["10000004", "10000005"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU 2",
          }),
          // Diplome most recent but not a 1<=>1 chain
          insertCFD({
            code_certification: "10000004",
            code_formation_diplome: "10000004",
            ancien_diplome: ["10000003"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU AUTRE",
          }),
          insertCFD({
            code_certification: "10000005",
            code_formation_diplome: "10000005",
            ancien_diplome: ["10000003"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU AUTRE 2",
          }),
          insertCertificationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ...DEFAULT_STATS,
          }),
          insertCertificationsStats({
            code_certification: "10000004",
            code_formation_diplome: "10000004",
            ...DEFAULT_STATS,
          }),
          insertCertificationsStats({
            code_certification: "10000005",
            code_formation_diplome: "10000005",
            ...DEFAULT_STATS,
          }),
          insertCertificationsStats({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const oldDiplome = await CertificationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          donnee_source: {
            code_certification: "10000003",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2020",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Ne récupère pas les données lorsque son enfant à plusieurs parents", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001", "10000000"],
          }),
          insertCertificationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await CertificationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(oldDiplome, null);
      });

      it("N'écrase pas les données si elles existent deja", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT",
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU",
          }),
          insertCertificationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            libelle: "BAC PRO BATIMENT NOUVEAU",
            ...DEFAULT_STATS,
          }),
          insertCertificationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            libelle: "BAC PRO BATIMENT",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await CertificationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          donnee_source: {
            code_certification: "10000001",
            type: "self",
          },
          filiere: "apprentissage",
          millesime: "2020",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    describe("Pour les anciens diplomes avec plusieurs enfants", () => {
      it("Ne récupère pas les données", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002", "10000003"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertCertificationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await CertificationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(oldDiplome, null);
      });
    });

    describe("Pour les diplomes sans données avec un enfant et un parent", () => {
      it("Récupère les données de l'enfant le plus récent", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT",
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            nouveau_diplome: ["10000003"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU",
          }),
          insertCFD({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ancien_diplome: ["10000002"],
            libelle_long: "BAC PRO BATIMENT NOUVEAU 2",
          }),
          insertCertificationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            libelle: "BAC PRO BATIMENT",
            ...DEFAULT_STATS,
          }),
          insertCertificationsStats({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            libelle: "BAC PRO BATIMENT NOUVEAU 2",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["certifications"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 2,
          updated: 1,
        });

        const oldDiplome = await CertificationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT NOUVEAU",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          donnee_source: {
            code_certification: "10000003",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2020",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });
  });

  describe("Regionales", () => {
    describe("Pour les nouveaux diplomes avec un seul parent", () => {
      it("Récupère les données lorsque son parent n'a qu'un enfant", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertRegionalesStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            ...DEFAULT_STATS,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const newDiplome = await RegionaleStatsRepository.first({ code_certification: "10000002", region: "11" });
        assert.deepEqual(omit(newDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: { code: "11", nom: "Île-de-France" },
          donnee_source: {
            code_certification: "10000001",
            type: "ancienne",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Ne récupère pas les données lorsque son parent à plusieurs enfants", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002", "10000003"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertRegionalesStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await RegionaleStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(newDiplome, null);
      });

      it("N'écrase pas les données si elles existent deja", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertRegionalesStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            ...DEFAULT_STATS,
          }),
          insertRegionalesStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await RegionaleStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(newDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "LIBELLE",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          donnee_source: {
            code_certification: "10000002",
            type: "self",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    describe("Pour les nouveaux diplomes avec plusieurs parents", () => {
      it("Ne récupère pas les données", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001", "10000000"],
          }),
          insertRegionalesStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await CertificationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(newDiplome, null);
      });
    });

    describe("Pour les anciens diplomes avec un seul enfant", () => {
      it("Récupère les données lorsque son enfant n'a qu'un parent", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertRegionalesStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ...DEFAULT_STATS,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          donnee_source: {
            code_certification: "10000002",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Récupère les données de l'enfant le plus récent (dernier en chaine 1 <=> 1", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            nouveau_diplome: ["10000003"],
          }),
          insertCFD({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ancien_diplome: ["10000002"],
            nouveau_diplome: ["10000004", "10000005"],
          }),
          // Diplome most recent but not a 1<=>1 chain
          insertCFD({
            code_certification: "10000004",
            code_formation_diplome: "10000004",
            ancien_diplome: ["10000003"],
          }),
          insertCFD({
            code_certification: "10000005",
            code_formation_diplome: "10000005",
            ancien_diplome: ["10000003"],
          }),
          insertRegionalesStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ...DEFAULT_STATS,
          }),
          insertRegionalesStats({
            code_certification: "10000004",
            code_formation_diplome: "10000004",
            ...DEFAULT_STATS,
          }),
          insertRegionalesStats({
            code_certification: "10000005",
            code_formation_diplome: "10000005",
            ...DEFAULT_STATS,
          }),
          insertRegionalesStats({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          donnee_source: {
            code_certification: "10000003",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Ne récupère pas les données lorsque son enfant à plusieurs parents", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001", "10000000"],
          }),
          insertRegionalesStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(oldDiplome, null);
      });

      it("N'écrase pas les données si elles existent deja", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertRegionalesStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ...DEFAULT_STATS,
          }),
          insertRegionalesStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "LIBELLE",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          donnee_source: {
            code_certification: "10000001",
            type: "self",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    describe("Pour les anciens diplomes avec plusieurs enfants", () => {
      it("Ne récupère pas les données", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002", "10000003"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertRegionalesStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(oldDiplome, null);
      });
    });

    describe("Pour les diplomes sans données avec un enfant et un parent", () => {
      it("Récupère les données de l'enfant le plus récent", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            nouveau_diplome: ["10000003"],
          }),
          insertCFD({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ancien_diplome: ["10000002"],
          }),
          insertRegionalesStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            ...DEFAULT_STATS,
          }),
          insertRegionalesStats({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["regionales"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 2,
          updated: 1,
        });

        const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          donnee_source: {
            code_certification: "10000003",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    it("N'écrase pas les données d'une autre région", async () => {
      await Promise.all([
        insertCFD({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          nouveau_diplome: ["10000002"],
        }),
        insertCFD({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          ancien_diplome: ["10000001"],
          nouveau_diplome: ["10000003"],
        }),
        insertCFD({
          code_certification: "10000003",
          code_formation_diplome: "10000003",
          ancien_diplome: ["10000002"],
        }),
        insertRegionalesStats({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          ...DEFAULT_STATS,
        }),
        insertRegionalesStats({
          code_certification: "10000003",
          code_formation_diplome: "10000003",
          region: { code: "03", nom: "Guyane" },
          ...DEFAULT_STATS_VARIANT,
        }),
        insertRegionalesStats({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          region: { code: "03", nom: "Guyane" },
          ...DEFAULT_STATS_VARIANT,
        }),
      ]);
      const result = await computeContinuumStats({ stats: ["regionales"] });
      assert.deepEqual(result, {
        created: 3,
        failed: 0,
        total: 4,
        updated: 1,
      });

      const oldDiplome = await RegionaleStatsRepository.first({ code_certification: "10000001", region: "11" });
      assert.deepEqual(omit(oldDiplome, "_id"), {
        code_certification: "10000001",
        code_certification_type: "cfd",
        code_formation_diplome: "10000001",
        libelle: "BAC PRO BATIMENT",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: { code: "11", nom: "Île-de-France" },
        donnee_source: {
          code_certification: "10000002",
          type: "nouvelle",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const newDiplome = await RegionaleStatsRepository.first({ code_certification: "10000003", region: "11" });
      assert.deepEqual(omit(newDiplome, "_id"), {
        code_certification: "10000003",
        code_certification_type: "cfd",
        code_formation_diplome: "10000003",
        libelle: "BAC PRO BATIMENT",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: { code: "11", nom: "Île-de-France" },
        donnee_source: {
          code_certification: "10000002",
          type: "ancienne",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const oldDiplomeOtherRegion = await RegionaleStatsRepository.first({
        code_certification: "10000001",
        region: "03",
      });
      assert.deepEqual(omit(oldDiplomeOtherRegion, "_id"), {
        code_certification: "10000001",
        code_certification_type: "cfd",
        code_formation_diplome: "10000001",
        libelle: "LIBELLE",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: {
          code: "03",
          nom: "Guyane",
        },
        donnee_source: {
          code_certification: "10000001",
          type: "self",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS_VARIANT,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const newDiplomeOtherRegion = await RegionaleStatsRepository.first({
        code_certification: "10000003",
        region: "03",
      });
      assert.deepEqual(omit(newDiplomeOtherRegion, "_id"), {
        code_certification: "10000003",
        code_certification_type: "cfd",
        code_formation_diplome: "10000003",
        libelle: "LIBELLE",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: {
          code: "03",
          nom: "Guyane",
        },
        donnee_source: {
          code_certification: "10000003",
          type: "self",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS_VARIANT,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
    });
  });

  describe("Formations", () => {
    describe("Pour les nouveaux diplomes avec un seul parent", () => {
      it("Récupère les données lorsque son parent n'a qu'un enfant", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertFormationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const newDiplome = await FormationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(newDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT",
          uai: "1234567",
          libelle_etablissement: "Lycée",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: { code: "11", nom: "Île-de-France" },
          academie: {
            code: "01",
            nom: "Paris",
          },
          donnee_source: {
            code_certification: "10000001",
            type: "ancienne",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Ne récupère pas les données lorsque son parent à plusieurs enfants", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002", "10000003"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertFormationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            uai: "1234567",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await FormationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(newDiplome, null);
      });

      it("N'écrase pas les données si elles existent deja", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertFormationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
          insertFormationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            uai: "1234567",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await FormationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(newDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "LIBELLE",
          uai: "1234567",
          libelle_etablissement: "Lycée",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          academie: {
            code: "01",
            nom: "Paris",
          },
          donnee_source: {
            code_certification: "10000002",
            type: "self",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    describe("Pour les nouveaux diplomes avec plusieurs parents", () => {
      it("Ne récupère pas les données", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001", "10000000"],
          }),
          insertFormationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            uai: "1234567",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const newDiplome = await FormationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(newDiplome, null);
      });
    });

    describe("Pour les anciens diplomes avec un seul enfant", () => {
      it("Récupère les données lorsque son enfant n'a qu'un parent", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertFormationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          uai: "1234567",
          libelle_etablissement: "Lycée",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          academie: {
            code: "01",
            nom: "Paris",
          },
          donnee_source: {
            code_certification: "10000002",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Récupère les données de l'enfant le plus récent (dernier en chaine 1 <=> 1", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            nouveau_diplome: ["10000003"],
          }),
          insertCFD({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ancien_diplome: ["10000002"],
            nouveau_diplome: ["10000004", "10000005"],
          }),
          // Diplome most recent but not a 1<=>1 chain
          insertCFD({
            code_certification: "10000004",
            code_formation_diplome: "10000004",
            ancien_diplome: ["10000003"],
          }),
          insertCFD({
            code_certification: "10000005",
            code_formation_diplome: "10000005",
            ancien_diplome: ["10000003"],
          }),
          insertFormationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
          insertFormationsStats({
            code_certification: "10000004",
            code_formation_diplome: "10000004",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
          insertFormationsStats({
            code_certification: "10000005",
            code_formation_diplome: "10000005",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
          insertFormationsStats({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            uai: "1234567",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 1,
          updated: 0,
        });

        const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "BAC PRO BATIMENT",
          uai: "1234567",
          libelle_etablissement: "Lycée",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          academie: {
            code: "01",
            nom: "Paris",
          },
          donnee_source: {
            code_certification: "10000003",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });

      it("Ne récupère pas les données lorsque son enfant à plusieurs parents", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001", "10000000"],
          }),
          insertFormationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            uai: "1234567",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(oldDiplome, null);
      });

      it("N'écrase pas les données si elles existent deja", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertFormationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
          insertFormationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            uai: "1234567",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000001",
          code_certification_type: "cfd",
          code_formation_diplome: "10000001",
          libelle: "LIBELLE",
          uai: "1234567",
          libelle_etablissement: "Lycée",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          academie: {
            code: "01",
            nom: "Paris",
          },
          donnee_source: {
            code_certification: "10000001",
            type: "self",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    describe("Pour les anciens diplomes avec plusieurs enfants", () => {
      it("Ne récupère pas les données", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002", "10000003"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
          }),
          insertFormationsStats({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            uai: "1234567",
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 0,
          failed: 0,
          total: 0,
          updated: 0,
        });

        const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000001" });
        assert.deepEqual(oldDiplome, null);
      });
    });

    describe("Pour les diplomes sans données avec un enfant et un parent", () => {
      it("Récupère les données de l'enfant le plus récent", async () => {
        await Promise.all([
          insertCFD({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            nouveau_diplome: ["10000002"],
          }),
          insertCFD({
            code_certification: "10000002",
            code_formation_diplome: "10000002",
            ancien_diplome: ["10000001"],
            nouveau_diplome: ["10000003"],
          }),
          insertCFD({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            ancien_diplome: ["10000002"],
          }),
          insertFormationsStats({
            code_certification: "10000001",
            code_formation_diplome: "10000001",
            uai: "1234567",
            ...DEFAULT_STATS,
          }),
          insertFormationsStats({
            code_certification: "10000003",
            code_formation_diplome: "10000003",
            uai: "1234567",
            ...DEFAULT_STATS_VARIANT,
          }),
        ]);
        const result = await computeContinuumStats({ stats: ["formations"] });
        assert.deepEqual(result, {
          created: 1,
          failed: 0,
          total: 2,
          updated: 1,
        });

        const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000002" });
        assert.deepEqual(omit(oldDiplome, "_id"), {
          code_certification: "10000002",
          code_certification_type: "cfd",
          code_formation_diplome: "10000002",
          libelle: "BAC PRO BATIMENT",
          uai: "1234567",
          libelle_etablissement: "Lycée",
          diplome: {
            code: "4",
            libelle: "BAC",
          },
          region: {
            code: "11",
            nom: "Île-de-France",
          },
          academie: {
            code: "01",
            nom: "Paris",
          },
          donnee_source: {
            code_certification: "10000003",
            type: "nouvelle",
          },
          filiere: "apprentissage",
          millesime: "2018_2019",
          ...DEFAULT_STATS_VARIANT,
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        });
      });
    });

    it("N'écrase pas les données d'un autre établissement", async () => {
      await Promise.all([
        insertCFD({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          nouveau_diplome: ["10000002"],
        }),
        insertCFD({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          ancien_diplome: ["10000001"],
          nouveau_diplome: ["10000003"],
        }),
        insertCFD({
          code_certification: "10000003",
          code_formation_diplome: "10000003",
          ancien_diplome: ["10000002"],
        }),
        insertFormationsStats({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          uai: "1234567",
          ...DEFAULT_STATS,
        }),
        insertFormationsStats({
          code_certification: "10000003",
          code_formation_diplome: "10000003",
          uai: "1200000",
          ...DEFAULT_STATS_VARIANT,
        }),
        insertFormationsStats({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          uai: "1200000",
          ...DEFAULT_STATS_VARIANT,
        }),
      ]);
      const result = await computeContinuumStats({ stats: ["formations"] });
      assert.deepEqual(result, {
        created: 3,
        failed: 0,
        total: 4,
        updated: 1,
      });

      const oldDiplome = await FormationStatsRepository.first({ code_certification: "10000001", uai: "1234567" });
      assert.deepEqual(omit(oldDiplome, "_id"), {
        code_certification: "10000001",
        code_certification_type: "cfd",
        code_formation_diplome: "10000001",
        libelle: "BAC PRO BATIMENT",
        uai: "1234567",
        libelle_etablissement: "Lycée",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: { code: "11", nom: "Île-de-France" },
        academie: {
          code: "01",
          nom: "Paris",
        },
        donnee_source: {
          code_certification: "10000002",
          type: "nouvelle",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const newDiplome = await FormationStatsRepository.first({ code_certification: "10000003", uai: "1234567" });
      assert.deepEqual(omit(newDiplome, "_id"), {
        code_certification: "10000003",
        code_certification_type: "cfd",
        code_formation_diplome: "10000003",
        libelle: "BAC PRO BATIMENT",
        uai: "1234567",
        libelle_etablissement: "Lycée",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: { code: "11", nom: "Île-de-France" },
        academie: {
          code: "01",
          nom: "Paris",
        },
        donnee_source: {
          code_certification: "10000002",
          type: "ancienne",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const oldDiplomeOtherRegion = await FormationStatsRepository.first({
        code_certification: "10000001",
        uai: "1200000",
      });
      assert.deepEqual(omit(oldDiplomeOtherRegion, "_id"), {
        code_certification: "10000001",
        code_certification_type: "cfd",
        code_formation_diplome: "10000001",
        libelle: "LIBELLE",
        uai: "1200000",
        libelle_etablissement: "Lycée",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: { code: "11", nom: "Île-de-France" },
        academie: {
          code: "01",
          nom: "Paris",
        },
        donnee_source: {
          code_certification: "10000001",
          type: "self",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS_VARIANT,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });

      const newDiplomeOtherRegion = await FormationStatsRepository.first({
        code_certification: "10000003",
        uai: "1200000",
      });
      assert.deepEqual(omit(newDiplomeOtherRegion, "_id"), {
        code_certification: "10000003",
        code_certification_type: "cfd",
        code_formation_diplome: "10000003",
        libelle: "LIBELLE",
        uai: "1200000",
        libelle_etablissement: "Lycée",
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        region: { code: "11", nom: "Île-de-France" },
        academie: {
          code: "01",
          nom: "Paris",
        },
        donnee_source: {
          code_certification: "10000003",
          type: "self",
        },
        filiere: "apprentissage",
        millesime: "2018_2019",
        ...DEFAULT_STATS_VARIANT,
        _meta: {
          created_on: new Date(),
          date_import: new Date(),
          updated_on: new Date(),
        },
      });
    });
  });
});
