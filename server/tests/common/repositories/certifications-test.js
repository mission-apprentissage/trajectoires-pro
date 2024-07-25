import deepEqualInAnyOrder from "deep-equal-in-any-order";
import chai from "chai";

import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";

import { insertCFD, insertMEF, insertCertificationsStats } from "#tests/utils/fakeData.js";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("repositories", () => {
  describe("certifications", () => {
    describe("getFilieresStats", () => {
      describe("Quand les CFDs sont les mêmes", async () => {
        it("Retourne les stats pour une filière", async () => {
          await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
          await insertCertificationsStats({
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
          await insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" });
          await insertCertificationsStats({
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

          const result = await CertificationStatsRepository.getFilieresStats({
            code_formation_diplome: "12345678",
            millesime: "2020",
          });
          assert.deepStrictEqual(result, {
            pro: {
              codes_certifications: ["23830024202"],
              code_formation_diplome: "12345678",
              codes_formation_diplome: ["12345678"],
              filiere: "pro",
              libelle: "LIBELLE",
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
              codes_formation_diplome: ["12345678"],
              filiere: "apprentissage",
              libelle: "LIBELLE",
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
      });

      describe("Quand les CFDs sont différents", async () => {
        it("Retourne les stats pour une filière", async () => {
          insertCertificationsStats({
            code_certification: "23830024201",
            code_formation_diplome: "87654321",
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
          insertCertificationsStats({
            code_certification: "87654321",
            code_formation_diplome: "87654321",
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
          insertCertificationsStats({
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
          insertCertificationsStats({
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

          const result = await CertificationStatsRepository.getFilieresStats({
            code_formation_diplome: ["12345678", "87654321"],
            millesime: "2020",
          });
          assert.deepEqualInAnyOrder(result, {
            pro: {
              codes_certifications: ["23830024201", "23830024202"],
              codes_formation_diplome: ["12345678", "87654321"],
              filiere: "pro",
              millesime: "2020",
              diplome: { code: "4", libelle: "BAC" },
              nb_annee_term: 100,
              nb_en_emploi_12_mois: 50,
              nb_en_emploi_18_mois: 50,
              nb_en_emploi_24_mois: 50,
              nb_en_emploi_6_mois: 90,
              nb_poursuite_etudes: 10,
              nb_sortant: 90,
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
              codes_certifications: ["87654321", "12345678"],
              codes_formation_diplome: ["87654321", "12345678"],
              filiere: "apprentissage",
              millesime: "2020",
              diplome: { code: "4", libelle: "BAC" },
              nb_annee_term: 100,
              nb_en_emploi_12_mois: 50,
              nb_en_emploi_18_mois: 50,
              nb_en_emploi_24_mois: 50,
              nb_en_emploi_6_mois: 90,
              nb_poursuite_etudes: 10,
              nb_sortant: 90,
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
      });

      describe("Quand les diplomes sont différents", async () => {
        it("Retourne les stats pour une filière", async () => {
          insertCertificationsStats({
            code_certification: "23830024201",
            code_formation_diplome: "87654321",
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

          insertCertificationsStats({
            code_certification: "23830024202",
            code_formation_diplome: "87654321",
            filiere: "pro",
            millesime: "2020",
            diplome: { code: "4", libelle: "BTS" },
            nb_sortant: 45,
            nb_annee_term: 50,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 45,
          });

          const result = await CertificationStatsRepository.getFilieresStats({
            code_formation_diplome: ["12345678", "87654321"],
            millesime: "2020",
          });
          assert.deepEqualInAnyOrder(result, {
            pro: {
              codes_certifications: ["23830024201", "23830024202"],
              code_formation_diplome: "87654321",
              codes_formation_diplome: ["87654321"],
              filiere: "pro",
              libelle: "LIBELLE",
              millesime: "2020",
              nb_annee_term: 100,
              nb_en_emploi_12_mois: 50,
              nb_en_emploi_18_mois: 50,
              nb_en_emploi_24_mois: 50,
              nb_en_emploi_6_mois: 90,
              nb_poursuite_etudes: 10,
              nb_sortant: 90,
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
      });

      it("Ne renvoie pas de somme pour une statistique quand tout les champs sont null", async () => {
        await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
        await insertCertificationsStats(
          {
            code_certification: "12345678",
            code_formation_diplome: "12345678",
            filiere: "apprentissage",
            millesime: "2020",
            nb_annee_term: 10,
          },
          false
        );
        await insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" });
        await insertCertificationsStats(
          {
            code_certification: "23830024202",
            code_formation_diplome: "12345678",
            filiere: "pro",
            millesime: "2020",
            nb_annee_term: 10,
          },
          false
        );

        const result = await CertificationStatsRepository.getFilieresStats({
          code_formation_diplome: "12345678",
          millesime: "2020",
        });

        assert.deepStrictEqual(result, {
          pro: {
            codes_certifications: ["23830024202"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            filiere: "pro",
            libelle: "LIBELLE",
            millesime: "2020",
            diplome: { code: "4", libelle: "BAC" },
            nb_annee_term: 10,
            nb_en_emploi_12_mois: null,
            nb_en_emploi_18_mois: null,
            nb_en_emploi_24_mois: null,
            nb_en_emploi_6_mois: null,
            taux_autres_12_mois: null,
            taux_autres_18_mois: null,
            taux_autres_24_mois: null,
            taux_autres_6_mois: null,
            nb_poursuite_etudes: null,
            nb_sortant: null,
            taux_en_emploi_12_mois: null,
            taux_en_emploi_18_mois: null,
            taux_en_emploi_24_mois: null,
            taux_en_emploi_6_mois: null,
            taux_en_formation: null,
          },
          apprentissage: {
            codes_certifications: ["12345678"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            filiere: "apprentissage",
            libelle: "LIBELLE",
            millesime: "2020",
            diplome: { code: "4", libelle: "BAC" },
            nb_annee_term: 10,
            nb_en_emploi_12_mois: null,
            nb_en_emploi_18_mois: null,
            nb_en_emploi_24_mois: null,
            nb_en_emploi_6_mois: null,
            nb_poursuite_etudes: null,
            taux_autres_12_mois: null,
            taux_autres_18_mois: null,
            taux_autres_24_mois: null,
            taux_autres_6_mois: null,
            nb_sortant: null,
            taux_en_emploi_12_mois: null,
            taux_en_emploi_18_mois: null,
            taux_en_emploi_24_mois: null,
            taux_en_emploi_6_mois: null,
            taux_en_formation: null,
          },
        });
      });
    });
  });
});
