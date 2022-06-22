import assert from "assert";
import { generateStats } from "../../src/jobs/generateStats.js";
import { insertCertificationsStats, insertCFD, insertFormationsStats } from "../utils/fakeData.js";
import { omit } from "lodash-es";
import { certificationsStats, formationsStats } from "../../src/common/collections/collections.js";

describe("generateStats", () => {
  it("Vérifie qu'on peut générer une stats à partir d'une stats de certification", async () => {
    await insertCertificationsStats({
      code_certification: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      filiere: "apprentissage",
      millesime: "2020",
      nb_annee_term: 56,
      nb_en_emploi_12_mois: 47,
      nb_en_emploi_6_mois: 45,
      nb_poursuite_etudes: 45,
      taux_emploi_12_mois: 58,
      taux_emploi_6_mois: 40,
      taux_poursuite_etudes: 12,
      taux_rupture_contrats: 11,
    });
    await insertCFD({
      code_formation: "12345678",
      code_formation_alternatifs: ["87456321"],
    });

    let stats = await generateStats();

    let found = await certificationsStats().findOne({ code_certification: "87456321" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_certification: "87456321",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      filiere: "apprentissage",
      millesime: "2020",
      nb_annee_term: 56,
      nb_en_emploi_12_mois: 47,
      nb_en_emploi_6_mois: 45,
      nb_poursuite_etudes: 45,
      taux_emploi_12_mois: 58,
      taux_emploi_6_mois: 40,
      taux_poursuite_etudes: 12,
      taux_rupture_contrats: 11,
    });
    assert.ok(found._meta.date_import);
    assert.ok(found._meta.generated);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut générer une stats à partir d'une stats de formation", async () => {
    await insertFormationsStats({
      code_certification: "12345678",
      uai: "0752197F",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      filiere: "apprentissage",
      millesime: "2018_2019",
      nb_annee_term: 67,
      nb_en_emploi_12_mois: 30,
      nb_en_emploi_6_mois: 92,
      nb_poursuite_etudes: 97,
      nb_sortant: 11,
      taux_emploi_12_mois: 77,
      taux_emploi_6_mois: 13,
      taux_poursuite_etudes: 98,
    });
    await insertCFD({
      code_formation: "12345678",
      code_formation_alternatifs: ["87456321"],
    });

    let stats = await generateStats();

    let found = await formationsStats().findOne({ code_certification: "87456321" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_certification: "87456321",
      uai: "0752197F",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      filiere: "apprentissage",
      millesime: "2018_2019",
      nb_annee_term: 67,
      nb_en_emploi_12_mois: 30,
      nb_en_emploi_6_mois: 92,
      nb_poursuite_etudes: 97,
      nb_sortant: 11,
      taux_emploi_12_mois: 77,
      taux_emploi_6_mois: 13,
      taux_poursuite_etudes: 98,
    });
    assert.ok(found._meta.date_import);
    assert.ok(found._meta.generated);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on ignore les stats sans code alternatif", async () => {
    await insertCertificationsStats({
      code_certification: "12345678",
    });
    await insertCFD({
      code_formation: "12345678",
    });

    await generateStats();

    const count = await certificationsStats().countDocuments({ code_certification: { $ne: "12345678" } });

    assert.strictEqual(count, 0);
  });

  it("Vérifie qu'on ignore les stats qui existent déjà dans inserjeunes", async () => {
    await insertCertificationsStats({
      code_certification: "12345678",
    });
    await insertCertificationsStats({
      code_certification: "87456321",
    });
    await insertCFD({
      code_formation: "12345678",
      code_formation_alternatifs: ["87456321"],
    });

    const stats = await generateStats();

    let found = await certificationsStats().findOne({ code_certification: "87456321" }, { projection: { _id: 0 } });
    assert.strictEqual(found._meta.generated, false);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 0 });
  });
});
