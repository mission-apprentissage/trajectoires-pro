import assert from "assert";
import { omit } from "lodash-es";
import { insertFormationsStats } from "../utils/fakeData.js";
import { formationsStats, regionStats } from "../../src/common/db/collections/collections.js";
import { computeRegionStats } from "../../src/jobs/computeRegionStats.js";

describe("computeRegionStats", () => {
  it("Vérifie qu'on peut calculer les stats d'une région", async () => {
    await Promise.all([
      insertFormationsStats({
        region: { code: "11", nom: "Île-de-France" },
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 1,
        nb_en_emploi_18_mois: 1,
        nb_en_emploi_24_mois: 1,
        nb_en_emploi_6_mois: 1,
        nb_poursuite_etudes: 1,
        nb_sortant: 1,
        taux_emploi_12_mois: 75,
        taux_emploi_18_mois: 75,
        taux_emploi_24_mois: 75,
        taux_emploi_6_mois: 75,
        taux_poursuite_etudes: 75,
      }),
      insertFormationsStats({
        region: { code: "11", nom: "Île-de-France" },
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 1,
        nb_en_emploi_18_mois: 1,
        nb_en_emploi_24_mois: 1,
        nb_en_emploi_6_mois: 1,
        nb_poursuite_etudes: 1,
        nb_sortant: 1,
        taux_emploi_12_mois: 25,
        taux_emploi_18_mois: 25,
        taux_emploi_24_mois: 25,
        taux_emploi_6_mois: 25,
        taux_poursuite_etudes: 25,
      }),
    ]);

    let stats = await computeRegionStats();

    let found = await regionStats().findOne({}, { projection: { _id: 0 } });
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
      nb_annee_term: 2,
      nb_en_emploi_12_mois: 2,
      nb_en_emploi_18_mois: 2,
      nb_en_emploi_24_mois: 2,
      nb_en_emploi_6_mois: 2,
      nb_poursuite_etudes: 2,
      nb_sortant: 2,
      taux_emploi_12_mois: 50,
      taux_emploi_18_mois: 50,
      taux_emploi_24_mois: 50,
      taux_emploi_6_mois: 50,
      taux_poursuite_etudes: 50,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut calculer les stats d'une région et qu'on ignore les données absentes", async () => {
    await Promise.all([
      formationsStats().insertOne({
        uai: "0751234J",
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        region: { code: "11", nom: "Île-de-France" },
      }),
      insertFormationsStats({
        filiere: "apprentissage",
        code_certification: "12345678",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
        region: { code: "11", nom: "Île-de-France" },
        nb_annee_term: 1,
        nb_en_emploi_12_mois: 1,
        nb_en_emploi_18_mois: 1,
        nb_en_emploi_24_mois: 1,
        nb_en_emploi_6_mois: 1,
        nb_poursuite_etudes: 1,
        nb_sortant: 1,
        taux_emploi_12_mois: 25,
        taux_emploi_18_mois: 25,
        taux_emploi_24_mois: 25,
        taux_emploi_6_mois: 25,
        taux_poursuite_etudes: 25,
      }),
    ]);

    let stats = await computeRegionStats();

    let found = await regionStats().findOne({}, { projection: { _id: 0 } });
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
      nb_annee_term: 1,
      nb_en_emploi_12_mois: 1,
      nb_en_emploi_18_mois: 1,
      nb_en_emploi_24_mois: 1,
      nb_en_emploi_6_mois: 1,
      nb_poursuite_etudes: 1,
      nb_sortant: 1,
      taux_emploi_12_mois: 25,
      taux_emploi_18_mois: 25,
      taux_emploi_24_mois: 25,
      taux_emploi_6_mois: 25,
      taux_poursuite_etudes: 25,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les données d'une stats de région", async () => {
    await insertFormationsStats({
      region: { code: "11", nom: "Île-de-France" },
      filiere: "apprentissage",
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
      nb_annee_term: 1,
      nb_en_emploi_12_mois: 1,
      nb_en_emploi_18_mois: 1,
      nb_en_emploi_24_mois: 1,
      nb_en_emploi_6_mois: 1,
      nb_poursuite_etudes: 1,
      nb_sortant: 1,
      taux_emploi_12_mois: 75,
      taux_emploi_18_mois: 75,
      taux_emploi_24_mois: 75,
      taux_emploi_6_mois: 75,
      taux_poursuite_etudes: 75,
    });
    await computeRegionStats();
    await formationsStats().updateOne(
      { filiere: "apprentissage" },
      {
        $set: {
          nb_sortant: 999,
          taux_poursuite_etudes: 999,
        },
      }
    );
    let stats = await computeRegionStats();

    let found = await regionStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_sortant, 999);
    assert.deepStrictEqual(found.taux_poursuite_etudes, 999);
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 1 });
  });
});
