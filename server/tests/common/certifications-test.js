import assert from "assert";
import { aggregateCertificationsStatsByFiliere } from "../../src/common/certifications.js";

describe("aggregateCertificationsStatsByFiliere", () => {
  it("should handle empty data", () => {
    assert.deepStrictEqual(aggregateCertificationsStatsByFiliere([]), {});
  });

  it("should aggregate certifications stats for one filiere, and keep only 1 millesime", () => {
    const certifications = [
      {
        millesime: "2020",
        code_certification: "3301144",
        filiere: "apprentissage",
        nb_annee_term: 1200,
        nb_poursuite_etudes: 400,
        nb_en_emploi_12_mois: 500,
        nb_en_emploi_6_mois: 600,
        nb_sortant: 800,
        taux_poursuite_etudes: 33,
        taux_emploi_12_mois: 63,
        taux_emploi_6_mois: 75,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
      {
        millesime: "2020",
        code_certification: "3301145",
        filiere: "apprentissage",
        nb_annee_term: 2000,
        nb_poursuite_etudes: 1000,
        nb_en_emploi_12_mois: 500,
        nb_en_emploi_6_mois: 750,
        nb_sortant: 1000,
        taux_poursuite_etudes: 50,
        taux_emploi_12_mois: 50,
        taux_emploi_6_mois: 75,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
      {
        millesime: "2019",
        code_certification: "3301146",
        filiere: "apprentissage",
        nb_annee_term: 1200,
        nb_poursuite_etudes: 400,
        nb_en_emploi_12_mois: 500,
        nb_en_emploi_6_mois: 600,
        nb_sortant: 800,
        taux_poursuite_etudes: 33,
        taux_emploi_12_mois: 63,
        taux_emploi_6_mois: 75,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
    ];

    assert.deepStrictEqual(aggregateCertificationsStatsByFiliere(certifications), {
      apprentissage: {
        codes_certifications: ["3301144", "3301145"],
        millesime: "2020",
        nb_annee_term: 3200,
        nb_en_emploi_12_mois: 1000,
        nb_en_emploi_6_mois: 1350,
        nb_poursuite_etudes: 1400,
        nb_sortant: 1800,
        taux_emploi_12_mois: 56,
        taux_emploi_6_mois: 75,
        taux_poursuite_etudes: 44,
      },
    });
  });

  it("should aggregate certifications stats for two filieres", () => {
    const certifications = [
      {
        millesime: "2020",
        code_certification: "3301144",
        filiere: "apprentissage",
        nb_annee_term: 1200,
        nb_poursuite_etudes: 400,
        nb_en_emploi_12_mois: 500,
        nb_en_emploi_6_mois: 600,
        nb_sortant: 800,
        taux_poursuite_etudes: 33,
        taux_emploi_12_mois: 63,
        taux_emploi_6_mois: 75,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
      {
        millesime: "2020",
        code_certification: "3301145",
        filiere: "apprentissage",
        nb_annee_term: 2000,
        nb_poursuite_etudes: 1000,
        nb_en_emploi_12_mois: 500,
        nb_en_emploi_6_mois: 750,
        nb_sortant: 1000,
        taux_poursuite_etudes: 50,
        taux_emploi_12_mois: 50,
        taux_emploi_6_mois: 75,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
      {
        millesime: "2020",
        code_certification: "3301146",
        filiere: "pro",
        nb_annee_term: 4000,
        nb_poursuite_etudes: 400,
        nb_en_emploi_12_mois: 500,
        nb_en_emploi_6_mois: 600,
        nb_sortant: 1000,
        taux_poursuite_etudes: 10,
        taux_emploi_12_mois: 50,
        taux_emploi_6_mois: 60,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
      {
        millesime: "2020",
        code_certification: "3301147",
        filiere: "pro",
        nb_annee_term: 1000,
        nb_poursuite_etudes: 500,
        nb_en_emploi_12_mois: 20,
        nb_en_emploi_6_mois: 100,
        nb_sortant: 200,
        taux_poursuite_etudes: 50,
        taux_emploi_12_mois: 10,
        taux_emploi_6_mois: 50,
        diplome: {
          code: "5",
          libelle: "BTS",
        },
      },
    ];

    assert.deepStrictEqual(aggregateCertificationsStatsByFiliere(certifications), {
      apprentissage: {
        codes_certifications: ["3301144", "3301145"],
        millesime: "2020",
        nb_annee_term: 3200,
        nb_en_emploi_12_mois: 1000,
        nb_en_emploi_6_mois: 1350,
        nb_poursuite_etudes: 1400,
        nb_sortant: 1800,
        taux_emploi_12_mois: 56,
        taux_emploi_6_mois: 75,
        taux_poursuite_etudes: 44,
      },
      pro: {
        codes_certifications: ["3301146", "3301147"],
        millesime: "2020",
        nb_annee_term: 5000,
        nb_en_emploi_12_mois: 520,
        nb_en_emploi_6_mois: 700,
        nb_poursuite_etudes: 900,
        nb_sortant: 1200,
        taux_emploi_12_mois: 43,
        taux_emploi_6_mois: 58,
        taux_poursuite_etudes: 18,
      },
    });
  });
});
