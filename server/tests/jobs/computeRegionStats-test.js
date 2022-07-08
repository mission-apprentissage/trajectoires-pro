import assert from "assert";
import { omit } from "lodash-es";
import { insertFormationsStats } from "../utils/fakeData.js";
import { formationsStats, regionStats } from "../../src/common/db/collections/collections.js";
import { computeRegionStats } from "../../src/jobs/computeRegionStats.js";

function insertNoStats() {
  return formationsStats().insertOne({
    uai: "0751234J",
    millesime: "2018_2019",
    filiere: "apprentissage",
    code_certification: "12345678",
    code_formation_diplome: "12345678",
    diplome: { code: "4", libelle: "BAC" },
    region: { code: "11", nom: "Île-de-France" },
  });
}

describe("computeRegionStats", () => {
  it("Vérifie qu'on peut calculer les stats d'une région", async () => {
    await Promise.all([
      insertFormationsStats({
        region: { code: "11", nom: "Île-de-France" },
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        nb_en_emploi_12_mois: 20,
        nb_en_emploi_18_mois: 20,
        nb_en_emploi_24_mois: 20,
        nb_en_emploi_6_mois: 20,
        nb_poursuite_etudes: 20,
        nb_sortant: 100,
        nb_annee_term: 200,
      }),
      insertFormationsStats({
        region: { code: "11", nom: "Île-de-France" },
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        nb_en_emploi_12_mois: 10,
        nb_en_emploi_18_mois: 10,
        nb_en_emploi_24_mois: 10,
        nb_en_emploi_6_mois: 10,
        nb_poursuite_etudes: 10,
        nb_sortant: 100,
        nb_annee_term: 200,
      }),
    ]);

    const stats = await computeRegionStats();

    const found = await regionStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      region: {
        code: "11",
        nom: "Île-de-France",
      },
      filiere: "apprentissage",
      millesime: "2018_2019",
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      nb_en_emploi_12_mois: 30,
      nb_en_emploi_18_mois: 30,
      nb_en_emploi_24_mois: 30,
      nb_en_emploi_6_mois: 30,
      nb_poursuite_etudes: 30,
      nb_sortant: 200,
      nb_annee_term: 400,
      taux_emploi_12_mois: 15,
      taux_emploi_18_mois: 15,
      taux_emploi_24_mois: 15,
      taux_emploi_6_mois: 15,
      taux_poursuite_etudes: 8,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut calculer les stats d'une région et qu'on ignore les données absentes", async () => {
    await Promise.all([
      insertNoStats(),
      insertFormationsStats({
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        region: { code: "11", nom: "Île-de-France" },
        nb_en_emploi_12_mois: 20,
        nb_en_emploi_18_mois: 20,
        nb_en_emploi_24_mois: 20,
        nb_en_emploi_6_mois: 20,
        nb_poursuite_etudes: 20,
        nb_sortant: 100,
        nb_annee_term: 200,
      }),
    ]);

    await computeRegionStats();

    const found = await regionStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      region: {
        code: "11",
        nom: "Île-de-France",
      },
      filiere: "apprentissage",
      millesime: "2018_2019",
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      nb_annee_term: 200,
      nb_en_emploi_12_mois: 20,
      nb_en_emploi_18_mois: 20,
      nb_en_emploi_24_mois: 20,
      nb_en_emploi_6_mois: 20,
      nb_poursuite_etudes: 20,
      nb_sortant: 100,
      taux_emploi_12_mois: 20,
      taux_emploi_18_mois: 20,
      taux_emploi_24_mois: 20,
      taux_emploi_6_mois: 20,
      taux_poursuite_etudes: 10,
    });
  });

  it("Vérifie qu'on peut mettre à jour les données d'une stats de région", async () => {
    await insertFormationsStats({
      nb_annee_term: 200,
      nb_poursuite_etudes: 20,
      taux_poursuite_etudes: 10,
    });
    await computeRegionStats();
    await formationsStats().updateOne(
      { filiere: "apprentissage" },
      {
        $set: {
          nb_annee_term: 300,
        },
      }
    );

    await computeRegionStats();

    const found = await regionStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_annee_term, 300);
    assert.deepStrictEqual(found.taux_poursuite_etudes, 7);
  });

  it("Vérifie qu'on ignore les taux avec des stats à 0", async () => {
    await Promise.all([
      insertFormationsStats({
        nb_sortant: 0,
        nb_annee_term: 0,
      }),
    ]);

    await computeRegionStats();

    let found = await regionStats().findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.nb_sortant, 0);
    assert.strictEqual(found.taux_emploi_24_mois, undefined);
    assert.strictEqual(found.taux_emploi_18_mois, undefined);
    assert.strictEqual(found.taux_emploi_12_mois, undefined);
    assert.strictEqual(found.taux_emploi_6_mois, undefined);
  });

  it("Vérifie qu'on ignore les taux avec des stats indisponibles", async () => {
    await Promise.all([
      insertNoStats(),
      insertFormationsStats({
        nb_sortant: 0,
        nb_annee_term: 0,
      }),
    ]);

    await computeRegionStats();

    let found = await regionStats().findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.nb_sortant, 0);
    assert.strictEqual(found.taux_emploi_24_mois, undefined);
    assert.strictEqual(found.taux_emploi_18_mois, undefined);
    assert.strictEqual(found.taux_emploi_12_mois, undefined);
    assert.strictEqual(found.taux_emploi_6_mois, undefined);
  });
});
