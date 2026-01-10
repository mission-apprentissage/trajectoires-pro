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
        lieu_formation_to_formateur: 0,
        formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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
              uai_formateur: ["ABCD0002"],
              uai_gestionnaire: ["ABCD1234"],
            },
            {
              uai: "ABCD0003",
              uai_type: "lieu_formation",
              uai_donnee: "ABCD1234",
              uai_donnee_type: "gestionnaire",
              uai_formateur: ["ABCD0004"],
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
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

    describe("Reclassification lieu_formation vers formateur (computeUaiFormateur)", () => {
      it("Reclassifie uai_type et uai_donnee_type en formateur quand le lieu_formation est aussi formateur avec d'autres lieux sans données", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // L'UAI est à la fois lieu de formation ET formateur pour un autre lieu
        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0003",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        // total: 2 car:
        // - computeUAIBase crée l'entrée initiale
        // - computeUAILieuFormationForFormateur crée le lieu ABCD0003
        assert.deepEqual(result, {
          total: 2,
          updated: 1,
          created: 1,
          failed: 0,
          lieu_formation_to_formateur: 1,
          formateur_to_gestionnaire: 0,
        });

        const stats = await FormationStatsRepository.first({ uai: uai });
        // uai_type ET uai_donnee_type sont "formateur" après reclassification
        assert.deepEqual(pick(stats, ["uai", "uai_type", "uai_donnee", "uai_donnee_type", "uai_lieu_formation"]), {
          uai: uai,
          uai_type: "formateur",
          uai_donnee: uai,
          uai_donnee_type: "formateur",
          uai_lieu_formation: [uai, "ABCD0003"],
        });

        // Vérifie que le lieu de formation ABCD0003 a été créé
        const statsLieu = await FormationStatsRepository.first({ uai: "ABCD0003" });
        assert.deepEqual(
          pick(statsLieu, ["uai", "uai_type", "uai_donnee", "uai_donnee_type", "uai_formateur", "uai_gestionnaire"]),
          {
            uai: "ABCD0003",
            uai_type: "lieu_formation",
            uai_donnee: uai,
            uai_donnee_type: "formateur",
            uai_formateur: [uai],
            uai_gestionnaire: ["ABCD0002"],
          }
        );
      });

      it("Ne reclassifie pas quand il n'y a pas d'autres lieux de formation", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // L'UAI est lieu de formation et formateur mais pas pour d'autres lieux
        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: uai,
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
          lieu_formation_to_formateur: 0,
          formateur_to_gestionnaire: 0,
        });

        const stats = await FormationStatsRepository.first({ uai: uai });
        assert.deepEqual(pick(stats, ["uai_type", "uai_donnee_type"]), {
          uai_type: "lieu_formation",
          uai_donnee_type: "lieu_formation",
        });
      });

      it("Ne reclassifie pas quand les autres lieux ont déjà des données", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0003",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        // L'autre lieu de formation a déjà des données
        await insertFormationsStats({
          uai: "ABCD0003",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.equal(result.lieu_formation_to_formateur, 0);

        const stats = await FormationStatsRepository.first({ uai: uai });
        assert.deepEqual(pick(stats, ["uai_type", "uai_donnee_type"]), {
          uai_type: "lieu_formation",
          uai_donnee_type: "lieu_formation",
        });
      });
    });

    describe("Reclassification formateur vers gestionnaire (computeUaiGestionnaire)", () => {
      it("Reclassifie uai_type et uai_donnee_type en gestionnaire quand le formateur est aussi gestionnaire avec d'autres formateurs sans données", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // L'UAI est formateur ET gestionnaire, et il existe un autre formateur sans données
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0002",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.equal(result.formateur_to_gestionnaire, 1);

        const stats = await FormationStatsRepository.first({ uai: uai });
        // Maintenant uai_type ET uai_donnee_type sont tous les deux "gestionnaire"
        assert.equal(stats.uai_type, "gestionnaire");
        assert.equal(stats.uai_donnee_type, "gestionnaire");
        // uai_formateur contient le gestionnaire lui-même + l'autre formateur
        assert.deepEqualInAnyOrder(stats.uai_formateur, [uai, "ABCD0003"]);
        // uai_lieu_formation contient les lieux des deux formateurs
        assert.deepEqualInAnyOrder(stats.uai_lieu_formation, ["ABCD0001", "ABCD0002"]);
      });

      it("Ne reclassifie pas quand il n'y a pas d'autres formateurs", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // L'UAI est formateur et gestionnaire unique
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.equal(result.formateur_to_gestionnaire, 0);
      });

      it("Ne reclassifie pas quand les autres formateurs ont déjà des données", async () => {
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
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0002",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });

        // L'autre formateur a déjà des données
        await insertFormationsStats({
          uai: "ABCD0003",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          uai_type: "formateur",
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        assert.equal(result.formateur_to_gestionnaire, 0);
      });

      it("Ne reclassifie pas quand l'autre formateur n'a pas de données directes mais tous ses lieux en ont", async () => {
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
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0002",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0004",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: "ABCD0002",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          uai_type: "lieu_formation",
        });
        await insertFormationsStats({
          uai: "ABCD0004",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          uai_type: "lieu_formation",
        });

        // Données pour le gestionnaire (qui est aussi formateur)
        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        const result = await computeUAI();
        // Ne devrait pas reclassifier car l'autre formateur a des données indirectes via ses lieux
        assert.equal(result.formateur_to_gestionnaire, 0);

        const stats = await FormationStatsRepository.first({ uai: uai });
        assert.deepEqual(pick(stats, ["uai_type", "uai_donnee_type"]), {
          uai_type: "formateur",
          uai_donnee_type: "formateur",
        });
      });
    });

    describe("Propagation des données formateur vers lieu_formation (computeUAILieuFormationForFormateur)", () => {
      it("Crée des entrées lieu_formation à partir des données formateur", async () => {
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
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
        });

        await computeUAI();

        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.isNotNull(lieuStats);
        assert.deepEqual(pick(lieuStats, ["uai", "uai_type", "uai_formateur", "uai_gestionnaire", "nb_annee_term"]), {
          uai: "ABCD0001",
          uai_type: "lieu_formation",
          uai_formateur: [uai],
          uai_gestionnaire: ["ABCD0002"],
          nb_annee_term: 100,
        });
      });

      it("Ne crée pas si les données existent déjà pour le lieu", async () => {
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
          nb_annee_term: 50,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
        });

        await computeUAI();

        // Vérifie que les données du lieu n'ont pas été écrasées
        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.equal(lieuStats.nb_annee_term, 50);
      });

      it("Ne crée pas si le lieu a plusieurs formateurs dans le CA", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // Deux formateurs différents pour le même lieu
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0005",
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await computeUAI();

        // Le lieu ne doit pas avoir été créé car il a plusieurs formateurs
        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.isNull(lieuStats);
      });

      it("Propage aussi les données après reclassification lieu_formation vers formateur", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // L'UAI est lieu de formation mais aussi formateur pour un autre lieu
        await insertCAFormation({
          cfd,
          uai_formation: uai,
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0003",
          etablissement_formateur_uai: uai,
          etablissement_gestionnaire_uai: "ABCD0002",
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
        });

        await computeUAI();

        // Après reclassification en formateur, les données doivent être propagées au lieu ABCD0003
        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0003" });
        assert.isNotNull(lieuStats);
        assert.equal(lieuStats.uai_type, "lieu_formation");
        assert.deepEqual(lieuStats.uai_formateur, [uai]);
      });
    });

    describe("Propagation des données gestionnaire vers lieu_formation (computeUAILieuFormationForGestionnaire)", () => {
      it("Crée des entrées lieu_formation à partir des données gestionnaire", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
        });

        await computeUAI();

        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.isNotNull(lieuStats);
        assert.deepEqual(pick(lieuStats, ["uai", "uai_type", "uai_formateur", "uai_gestionnaire", "nb_annee_term"]), {
          uai: "ABCD0001",
          uai_type: "lieu_formation",
          uai_formateur: ["ABCD0003"],
          uai_gestionnaire: [uai],
          nb_annee_term: 100,
        });
      });

      it("Ne crée pas si les données existent déjà pour le lieu", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });

        // Le lieu de formation a déjà des données
        await insertFormationsStats({
          uai: "ABCD0001",
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 50,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
          nb_annee_term: 100,
        });

        await computeUAI();

        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.equal(lieuStats.nb_annee_term, 50);
      });

      it("Ne crée pas si le lieu a plusieurs gestionnaires dans le CA", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // Deux gestionnaires différents pour le même lieu
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: "ABCD0005",
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await computeUAI();

        // Le lieu ne doit pas avoir été créé car il a plusieurs gestionnaires
        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.isNull(lieuStats);
      });

      it("Récupère les formateurs depuis le CA pour chaque lieu", async () => {
        const cfd = createCodeFormationDiplome();
        const uai = "ABCD1234";

        await insertCFD({
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        // Plusieurs formateurs pour le même lieu avec le même gestionnaire
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0003",
          etablissement_gestionnaire_uai: uai,
        });
        await insertCAFormation({
          cfd,
          uai_formation: "ABCD0001",
          etablissement_formateur_uai: "ABCD0004",
          etablissement_gestionnaire_uai: uai,
        });

        await insertFormationsStats({
          uai: uai,
          filiere: "apprentissage",
          code_certification: cfd,
          code_formation_diplome: cfd,
        });

        await computeUAI();

        const lieuStats = await FormationStatsRepository.first({ uai: "ABCD0001" });
        assert.isNotNull(lieuStats);
        assert.deepEqualInAnyOrder(lieuStats.uai_formateur, ["ABCD0003", "ABCD0004"]);
      });
    });
  });
});
