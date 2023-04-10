import assert from "assert";

import CertificationRepository from "../../../src/common/repositories/certifications.js";

import { insertCFD, insertMEF, insertCertificationsStats } from "../../utils/fakeData.js";

describe("repositories", () => {
  describe("regionales", () => {
    describe("getFilieresStats", () => {
      it("Retourne les stats pour une filière", async () => {
        insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
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
        insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" });
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

        const result = await CertificationRepository.getFilieresStats({
          code_formation_diplome: "12345678",
          millesime: "2020",
        });
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
    });
  });
});
