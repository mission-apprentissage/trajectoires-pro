import * as chai from "chai";
import { omit, pick } from "lodash-es";
import MockDate from "mockdate";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { computeUAI } from "#src/jobs/stats/computeUAI.js";
import {
  insertCFD,
  insertFormationsStats,
  insertCAFormation,
  createCodeFormationDiplome,
} from "#tests/utils/fakeData.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("computeUAI", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("Pour la voie scolaire", () => {
    it("Associe l'UAI lieu de formation, l'UAI formateur et l'UAI gestionnaire à l'UAI des données", async () => {
      await insertFormationsStats({
        uai: "ABCD1234",
        filiere: "pro",
      });

      const result = await computeUAI();
      assert.deepEqual(result, {
        total: 1,
        updated: 1,
        created: 0,
        failed: 0,
      });

      const stats = await FormationStatsRepository.first({});
      assert.deepEqual(
        pick(stats, ["uai", "uai_type", "uai_donnee", "uai_donnee_type", "uai_formateur", "uai_gestionnaire"]),
        {
          uai: "ABCD1234",
          uai_type: "lieu_formation",
          uai_donnee: "ABCD1234",
          uai_donnee_type: "lieu_formation",
          uai_formateur: ["ABCD1234"],
          uai_gestionnaire: ["ABCD1234"],
        }
      );
    });
  });

  describe("Pour la voie apprentissage", () => {
    describe("Lorsque l'UAI des données correspond au lieu de formation", () => {
      it("Associe les UAIs lieu de formation, formateur, gestionnaire", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: "ABCD0001",
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 1,
          updated: 1,
          created: 0,
          failed: 0,
        });

        const stats = await FormationStatsRepository.first({});
        assert.deepEqual(
          pick(stats, [
            "uai",
            "uai_type",
            "uai_donnee",
            "uai_donnee_type",
            "uai_lieu_formation",
            "uai_formateur",
            "uai_gestionnaire",
          ]),
          {
            uai: "ABCD1234",
            uai_type: "lieu_formation",
            uai_donnee: "ABCD1234",
            uai_donnee_type: "lieu_formation",
            uai_formateur: ["ABCD0001"],
            uai_gestionnaire: ["ABCD0002"],
          }
        );
      });

      it("Associe l'UAI lieu de formation et tout les UAIs formateur et gestionnaire lorsqu'il y en a plusieurs", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: "ABCD0001",
          etablissement_gestionnaire_uai: "ABCD0002",
        });
        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: "ABCD0004",
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 1,
          updated: 1,
          created: 0,
          failed: 0,
        });

        const stats = await FormationStatsRepository.first({});
        assert.deepEqual(
          pick(stats, [
            "uai",
            "uai_type",
            "uai_donnee",
            "uai_donnee_type",
            "uai_lieu_formation",
            "uai_formateur",
            "uai_gestionnaire",
          ]),
          {
            uai: "ABCD1234",
            uai_type: "lieu_formation",
            uai_donnee: "ABCD1234",
            uai_donnee_type: "lieu_formation",
            uai_formateur: ["ABCD0001", "ABCD0003"],
            uai_gestionnaire: ["ABCD0002", "ABCD0004"],
          }
        );
      });

      it("Associe les UAIs lieu de formation, formateur, gestionnaire en utilisant l'ancien code diplome (continuum)", async () => {
        const cfd = createCodeFormationDiplome();
        const cfdParent = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
          ancien_diplome: [cfdParent],
        });
        await insertCFD({
          code_certification: cfdParent,
          code_formation_diplome: cfdParent,
          nouveau_diplome: [cfd],
        });

        await insertCAFormation({
          cfd: cfd,
          uai_formation: uai,
          etablissement_formateur_uai: "ABCD0001",
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfdParent,
          code_formation_diplome: cfdParent,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 1,
          updated: 1,
          created: 0,
          failed: 0,
        });

        const stats = await FormationStatsRepository.first({});
        assert.deepEqual(
          pick(stats, [
            "uai",
            "uai_type",
            "uai_donnee",
            "uai_donnee_type",
            "uai_lieu_formation",
            "uai_formateur",
            "uai_gestionnaire",
          ]),
          {
            uai: "ABCD1234",
            uai_type: "lieu_formation",
            uai_donnee: "ABCD1234",
            uai_donnee_type: "lieu_formation",
            uai_formateur: ["ABCD0001"],
            uai_gestionnaire: ["ABCD0002"],
          }
        );
      });

      it("Associe les UAIs lieu de formation, formateur, gestionnaire en utilisant le nouveau code diplome (continuum)", async () => {
        const cfd = createCodeFormationDiplome();
        const cfdChildren = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
          nouveau_diplome: [cfdChildren],
        });
        await insertCFD({
          code_certification: cfdChildren,
          code_formation_diplome: cfdChildren,
          ancien_diplome: [cfd],
        });

        await insertCAFormation({
          cfd: cfd,
          uai_formation: uai,
          etablissement_formateur_uai: "ABCD0001",
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfdChildren,
          code_formation_diplome: cfdChildren,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 1,
          updated: 1,
          created: 0,
          failed: 0,
        });

        const stats = await FormationStatsRepository.first({});
        assert.deepEqual(
          pick(stats, [
            "uai",
            "uai_type",
            "uai_donnee",
            "uai_donnee_type",
            "uai_lieu_formation",
            "uai_formateur",
            "uai_gestionnaire",
          ]),
          {
            uai: "ABCD1234",
            uai_type: "lieu_formation",
            uai_donnee: "ABCD1234",
            uai_donnee_type: "lieu_formation",
            uai_formateur: ["ABCD0001"],
            uai_gestionnaire: ["ABCD0002"],
          }
        );
      });
    });

    describe("Lorsque l'UAI des données correspond au formateur", () => {
      it("Associe les UAIs lieu de formation, formateur, gestionnaire", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 2,
          updated: 1,
          created: 1,
          failed: 0,
        });

        const stats = await FormationStatsRepository.find({}).then((r) => r.toArray());
        assert.deepEqualInAnyOrder(
          stats.map((s) =>
            pick(s, [
              "uai",
              "uai_type",
              "uai_donnee",
              "uai_donnee_type",
              "uai_lieu_formation",
              "uai_formateur",
              "uai_gestionnaire",
            ])
          ),
          [
            {
              uai: "ABCD1234",
              uai_type: "formateur",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "formateur",
              uai_lieu_formation: ["ABCD0001"],
              uai_gestionnaire: ["ABCD0002"],
            },
            {
              uai: "ABCD0001",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "formateur",
              uai_formateur: ["ABCD1234"],
              uai_gestionnaire: ["ABCD0002"],
            },
          ]
        );
      });

      it("Associe l'UAI formateur et tout les UAIs lieu de formation et gestionnaire lorsqu'il y en a plusieurs", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0003",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0004",
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 3,
          updated: 1,
          created: 2,
          failed: 0,
        });

        const stats = await FormationStatsRepository.find({}).then((r) => r.toArray());
        assert.deepEqualInAnyOrder(
          stats.map((s) =>
            pick(s, [
              "uai",
              "uai_type",
              "uai_donnee",
              "uai_donnee_type",
              "uai_lieu_formation",
              "uai_formateur",
              "uai_gestionnaire",
            ])
          ),
          [
            {
              uai: "ABCD1234",
              uai_type: "formateur",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "formateur",
              uai_lieu_formation: ["ABCD0001", "ABCD0003"],
              uai_gestionnaire: ["ABCD0002", "ABCD0004"],
            },
            {
              uai: "ABCD0001",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "formateur",
              uai_formateur: ["ABCD1234"],
              uai_gestionnaire: ["ABCD0002", "ABCD0004"],
            },
            {
              uai: "ABCD0003",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "formateur",
              uai_formateur: ["ABCD1234"],
              uai_gestionnaire: ["ABCD0002", "ABCD0004"],
            },
          ]
        );
      });

      it("N'écrase pas les données d'un lieu de formation si elles existent déjà", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: "ABCD0001",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
          nb_poursuite_etudes: 1,
          nb_en_emploi_24_mois: 2,
          nb_en_emploi_18_mois: 3,
          nb_en_emploi_12_mois: 4,
          nb_en_emploi_6_mois: 5,
          nb_sortant: 6,
          taux_rupture_contrats: 7,
          taux_en_formation: 8,
          taux_en_emploi_24_mois: 9,
          taux_en_emploi_18_mois: 10,
          taux_en_emploi_12_mois: 11,
          taux_en_emploi_6_mois: 12,
          taux_autres_6_mois: 13,
          taux_autres_12_mois: 14,
          taux_autres_18_mois: 15,
          taux_autres_24_mois: 16,
          salaire_12_mois_q1: 17,
          salaire_12_mois_q2: 18,
          salaire_12_mois_q3: 19,
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 200,
          nb_poursuite_etudes: 2,
          nb_en_emploi_24_mois: 3,
          nb_en_emploi_18_mois: 4,
          nb_en_emploi_12_mois: 5,
          nb_en_emploi_6_mois: 6,
          nb_sortant: 7,
          taux_rupture_contrats: 8,
          taux_en_formation: 9,
          taux_en_emploi_24_mois: 10,
          taux_en_emploi_18_mois: 11,
          taux_en_emploi_12_mois: 12,
          taux_en_emploi_6_mois: 13,
          taux_autres_6_mois: 14,
          taux_autres_12_mois: 15,
          taux_autres_18_mois: 16,
          taux_autres_24_mois: 17,
          salaire_12_mois_q1: 18,
          salaire_12_mois_q2: 19,
          salaire_12_mois_q3: 20,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 2,
          updated: 2,
          created: 0,
          failed: 0,
        });

        const stats = await FormationStatsRepository.find({}).then((r) => r.toArray());
        assert.deepEqualInAnyOrder(
          stats.map((s) =>
            omit(s, [
              "_id",
              "_meta",
              "academie",
              "diplome",
              "donnee_source",
              "filiere",
              "libelle",
              "millesime",
              "region",
            ])
          ),
          [
            {
              uai: "ABCD0001",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD0001",
              uai_donnee_type: "lieu_formation",
              uai_formateur: ["ABCD1234"],
              uai_gestionnaire: ["ABCD0002"],
              libelle_etablissement: "Lycée",
              code_certification: cfd,
              code_certification_type: "cfd",
              code_formation_diplome: cfd,
              nb_annee_term: 100,
              nb_poursuite_etudes: 1,
              nb_en_emploi_24_mois: 2,
              nb_en_emploi_18_mois: 3,
              nb_en_emploi_12_mois: 4,
              nb_en_emploi_6_mois: 5,
              nb_sortant: 6,
              taux_rupture_contrats: 7,
              taux_en_formation: 8,
              taux_en_emploi_24_mois: 9,
              taux_en_emploi_18_mois: 10,
              taux_en_emploi_12_mois: 11,
              taux_en_emploi_6_mois: 12,
              taux_autres_6_mois: 13,
              taux_autres_12_mois: 14,
              taux_autres_18_mois: 15,
              taux_autres_24_mois: 16,
              salaire_12_mois_q1: 17,
              salaire_12_mois_q2: 18,
              salaire_12_mois_q3: 19,
            },
            {
              uai: "ABCD1234",
              uai_type: "formateur",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "formateur",
              uai_lieu_formation: ["ABCD0001"],
              uai_gestionnaire: ["ABCD0002"],
              libelle_etablissement: "Lycée",
              code_certification: cfd,
              code_certification_type: "cfd",
              code_formation_diplome: cfd,
              nb_annee_term: 200,
              nb_poursuite_etudes: 2,
              nb_en_emploi_24_mois: 3,
              nb_en_emploi_18_mois: 4,
              nb_en_emploi_12_mois: 5,
              nb_en_emploi_6_mois: 6,
              nb_sortant: 7,
              taux_rupture_contrats: 8,
              taux_en_formation: 9,
              taux_en_emploi_24_mois: 10,
              taux_en_emploi_18_mois: 11,
              taux_en_emploi_12_mois: 12,
              taux_en_emploi_6_mois: 13,
              taux_autres_6_mois: 14,
              taux_autres_12_mois: 15,
              taux_autres_18_mois: 16,
              taux_autres_24_mois: 17,
              salaire_12_mois_q1: 18,
              salaire_12_mois_q2: 19,
              salaire_12_mois_q3: 20,
            },
          ]
        );
      });
    });

    describe("Lorsque l'UAI des données correspond au gestionnaire", () => {
      it("Associe les UAIs lieu de formation, formateur, gestionnaire", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0002",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 2,
          updated: 1,
          created: 1,
          failed: 0,
        });

        const stats = await FormationStatsRepository.find({}).then((r) => r.toArray());
        assert.deepEqualInAnyOrder(
          stats.map((s) =>
            pick(s, [
              "uai",
              "uai_type",
              "uai_donnee",
              "uai_donnee_type",
              "uai_lieu_formation",
              "uai_formateur",
              "uai_gestionnaire",
            ])
          ),
          [
            {
              uai: "ABCD1234",
              uai_type: "gestionnaire",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_lieu_formation: ["ABCD0001"],
              uai_formateur: ["ABCD0002"],
            },
            {
              uai: "ABCD0001",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_formateur: ["ABCD0002"],
              uai_gestionnaire: ["ABCD1234"],
            },
          ]
        );
      });

      it("Associe l'UAI formateur et tout les UAIs lieu de formation et gestionnaire lorsqu'il y en a plusieurs", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0002",
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0003",
          etablissement_formateur_uai: "ABCD0004",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 3,
          updated: 1,
          created: 2,
          failed: 0,
        });

        const stats = await FormationStatsRepository.find({}).then((r) => r.toArray());
        assert.deepEqualInAnyOrder(
          stats.map((s) =>
            pick(s, [
              "uai",
              "uai_type",
              "uai_donnee",
              "uai_donnee_type",
              "uai_lieu_formation",
              "uai_formateur",
              "uai_gestionnaire",
            ])
          ),
          [
            {
              uai: "ABCD1234",
              uai_type: "gestionnaire",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_lieu_formation: ["ABCD0001", "ABCD0003"],
              uai_formateur: ["ABCD0002", "ABCD0004"],
            },
            {
              uai: "ABCD0001",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_formateur: ["ABCD0002", "ABCD0004"],
              uai_gestionnaire: ["ABCD1234"],
            },
            {
              uai: "ABCD0003",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_formateur: ["ABCD0002", "ABCD0004"],
              uai_gestionnaire: ["ABCD1234"],
            },
          ]
        );
      });

      it("N'écrase pas les données d'un lieu de formation si elles existent déjà", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0002",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: "ABCD0001",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
          nb_poursuite_etudes: 1,
          nb_en_emploi_24_mois: 2,
          nb_en_emploi_18_mois: 3,
          nb_en_emploi_12_mois: 4,
          nb_en_emploi_6_mois: 5,
          nb_sortant: 6,
          taux_rupture_contrats: 7,
          taux_en_formation: 8,
          taux_en_emploi_24_mois: 9,
          taux_en_emploi_18_mois: 10,
          taux_en_emploi_12_mois: 11,
          taux_en_emploi_6_mois: 12,
          taux_autres_6_mois: 13,
          taux_autres_12_mois: 14,
          taux_autres_18_mois: 15,
          taux_autres_24_mois: 16,
        });

        await insertFormationsStats({
          uai: "ABCD1234",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 200,
          nb_poursuite_etudes: 2,
          nb_en_emploi_24_mois: 3,
          nb_en_emploi_18_mois: 4,
          nb_en_emploi_12_mois: 5,
          nb_en_emploi_6_mois: 6,
          nb_sortant: 7,
          taux_rupture_contrats: 8,
          taux_en_formation: 9,
          taux_en_emploi_24_mois: 10,
          taux_en_emploi_18_mois: 11,
          taux_en_emploi_12_mois: 12,
          taux_en_emploi_6_mois: 13,
          taux_autres_6_mois: 14,
          taux_autres_12_mois: 15,
          taux_autres_18_mois: 16,
          taux_autres_24_mois: 17,
        });

        const result = await computeUAI();
        assert.deepEqual(result, {
          total: 2,
          updated: 2,
          created: 0,
          failed: 0,
        });

        const stats = await FormationStatsRepository.find({}).then((r) => r.toArray());
        assert.deepEqualInAnyOrder(
          stats.map((s) =>
            omit(s, [
              "_id",
              "_meta",
              "academie",
              "diplome",
              "donnee_source",
              "filiere",
              "libelle",
              "millesime",
              "region",
            ])
          ),
          [
            {
              uai: "ABCD0001",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD0001",
              uai_donnee_type: "lieu_formation",
              uai_formateur: ["ABCD0002"],
              uai_gestionnaire: ["ABCD1234"],
              libelle_etablissement: "Lycée",
              code_certification: cfd,
              code_certification_type: "cfd",
              code_formation_diplome: cfd,
              nb_annee_term: 100,
              nb_poursuite_etudes: 1,
              nb_en_emploi_24_mois: 2,
              nb_en_emploi_18_mois: 3,
              nb_en_emploi_12_mois: 4,
              nb_en_emploi_6_mois: 5,
              nb_sortant: 6,
              taux_rupture_contrats: 7,
              taux_en_formation: 8,
              taux_en_emploi_24_mois: 9,
              taux_en_emploi_18_mois: 10,
              taux_en_emploi_12_mois: 11,
              taux_en_emploi_6_mois: 12,
              taux_autres_6_mois: 13,
              taux_autres_12_mois: 14,
              taux_autres_18_mois: 15,
              taux_autres_24_mois: 16,
            },
            {
              uai: "ABCD1234",
              uai_type: "gestionnaire",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_lieu_formation: ["ABCD0001"],
              uai_formateur: ["ABCD0002"],
              libelle_etablissement: "Lycée",
              code_certification: cfd,
              code_certification_type: "cfd",
              code_formation_diplome: cfd,
              nb_annee_term: 200,
              nb_poursuite_etudes: 2,
              nb_en_emploi_24_mois: 3,
              nb_en_emploi_18_mois: 4,
              nb_en_emploi_12_mois: 5,
              nb_en_emploi_6_mois: 6,
              nb_sortant: 7,
              taux_rupture_contrats: 8,
              taux_en_formation: 9,
              taux_en_emploi_24_mois: 10,
              taux_en_emploi_18_mois: 11,
              taux_en_emploi_12_mois: 12,
              taux_en_emploi_6_mois: 13,
              taux_autres_6_mois: 14,
              taux_autres_12_mois: 15,
              taux_autres_18_mois: 16,
              taux_autres_24_mois: 17,
            },
          ]
        );
      });
    });
  });
});
