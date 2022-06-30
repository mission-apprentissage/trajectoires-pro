import assert from "assert";
import { startServer } from "../utils/testUtils.js";
import { insertCertificationsStats } from "../utils/fakeData.js";

describe("filieresRoutes", () => {
  it("Vérifie qu'on peut obtenir les données pour deux filières", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({
      code_certification: "23830024203",
      filiere: "apprentissage",
      taux_poursuite_etudes: 5,
      taux_emploi_6_mois: 6,
      taux_emploi_12_mois: 12,
      millesime: "2020",
      nb_annee_term: 100,
      nb_poursuite_etudes: 5,
      nb_en_emploi_6_mois: 6,
      nb_en_emploi_12_mois: 12,
      nb_sortant: 100,
    });
    await insertCertificationsStats({
      code_certification: "23830024202",
      filiere: "pro",
      taux_poursuite_etudes: 10,
      taux_emploi_6_mois: 6,
      taux_emploi_12_mois: 12,
      millesime: "2020",
      nb_annee_term: 100,
      nb_poursuite_etudes: 10,
      nb_en_emploi_6_mois: 6,
      nb_en_emploi_12_mois: 12,
      nb_sortant: 100,
    });

    const response = await httpClient.get("/api/inserjeunes/filieres/23830024203|23830024202");

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      _meta: {
        description:
          "Données InserJeunes du millesime 2020 aggrégées pour les certifications: 23830024203 (BAC filière apprentissage), 23830024202 (BAC filière pro)",
        title: "Certifications: 23830024203, 23830024202",
      },
      apprentissage: {
        _meta: {
          description:
            "Données InserJeunes du millesime 2020 aggrégées pour les certifications: 23830024203 (BAC filière apprentissage)",
          title: "Certifications: 23830024203",
        },
        codes_certifications: ["23830024203"],
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        filiere: "apprentissage",
        millesime: "2020",
        nb_annee_term: 100,
        nb_en_emploi_12_mois: 12,
        nb_en_emploi_6_mois: 6,
        nb_poursuite_etudes: 5,
        nb_sortant: 100,
        taux_emploi_12_mois: 12,
        taux_emploi_6_mois: 6,
        taux_poursuite_etudes: 5,
      },
      pro: {
        _meta: {
          description:
            "Données InserJeunes du millesime 2020 aggrégées pour les certifications: 23830024202 (BAC filière pro)",
          title: "Certifications: 23830024202",
        },
        codes_certifications: ["23830024202"],
        diplome: {
          code: "4",
          libelle: "BAC",
        },
        filiere: "pro",
        millesime: "2020",
        nb_annee_term: 100,
        nb_en_emploi_12_mois: 12,
        nb_en_emploi_6_mois: 6,
        nb_poursuite_etudes: 10,
        nb_sortant: 100,
        taux_emploi_12_mois: 12,
        taux_emploi_6_mois: 6,
        taux_poursuite_etudes: 10,
      },
    });
  });

  it("Vérifie qu'on peut obtenir le widget pour deux filières", async () => {
    const { httpClient } = await startServer();
    await Promise.all([
      insertCertificationsStats({
        code_certification: "23830024203",
        filiere: "apprentissage",
        taux_poursuite_etudes: 5,
        taux_emploi_6_mois: 50,
        millesime: "2020",
        nb_annee_term: 100,
        nb_poursuite_etudes: 5,
        nb_en_emploi_6_mois: 25,
        nb_sortant: 50,
      }),
      insertCertificationsStats({
        code_certification: "23830024202",
        filiere: "pro",
        taux_poursuite_etudes: 10,
        taux_emploi_6_mois: 25,
        millesime: "2020",
        nb_annee_term: 100,
        nb_poursuite_etudes: 10,
        nb_en_emploi_6_mois: 15,
        nb_sortant: 60,
      }),
    ]);

    const response = await httpClient.get("/api/inserjeunes/filieres/23830024203|23830024202.svg");

    assert.strictEqual(response.status, 200);
    assert.ok(response.headers["content-type"].includes("image/svg+xml"));
    assert.ok(response.data.includes("Apprentissage"));
    assert.ok(response.data.includes("Voie scolaire"));
    assert.ok(response.data.includes("<title>Certifications: 23830024203, 23830024202</title>"));
    assert.ok(
      response.data.includes(
        "<desc>Données InserJeunes du millesime 2020 aggrégées pour les certifications: 23830024203 (BAC filière apprentissage), 23830024202 (BAC filière pro)</desc>"
      )
    );
  });
});
