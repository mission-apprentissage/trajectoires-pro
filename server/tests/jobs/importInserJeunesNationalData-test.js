const assert = require("assert");
const importInserJeunesNationalData = require("../../src/jobs/importInserJeunesNationalData");
const { createStream } = require("../utils/testUtils");
const { dbCollection } = require("../../src/common/mongodb");

describe("importInserJeunesNationalData", () => {
  it("Vérifie qu'on peut ajouter les données du fichier national inserJeunes (apprentissage)", async () => {
    const input =
      createStream(`Code Formation;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme rénové ou nouveau;Taux de poursuite d'études;nb en poursuite d'études;nb en année terminale;Taux d'emploi 6 mois après la sortie;nb en emploi 6 mois après la sortie;nb de sortants 6 mois après la sortie;Taux d'emploi 12 mois après la sortie;nb en emploi 12 mois après la sortie
      "40023303";BAC PRO;menuiserie aluminium-verre;"3";non;"22";"11";"49";"66";"25";"38";"82";"31"`);

    const stats = await importInserJeunesNationalData({ input, type: "apprentissage", millesime: "2020-2019" });

    assert.deepStrictEqual(stats, { created: 1, failed: 0, total: 1, updated: 0 });

    const docs = await dbCollection("inserJeunesNationals")
      .find({}, { projection: { _id: 0 } })
      .toArray();

    assert.strictEqual(docs.length, 1);
    assert.deepStrictEqual(docs[0], {
      code_formation: "40023303",
      libelle_de_la_formation: "menuiserie aluminium-verre",
      millesime: "2020-2019",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 3,
      nb_en_annee_terminale: 49,
      nb_en_emploi_12_mois_apres_la_sortie: 31,
      nb_en_emploi_6_mois_apres_la_sortie: 25,
      nb_en_poursuite_etudes: 11,
      nb_sortants_6_mois_apres_la_sortie: 38,
      taux_de_poursuite_etudes: 22,
      taux_emploi_12_mois_apres_la_sortie: 82,
      taux_emploi_6_mois_apres_la_sortie: 66,
      type: "apprentissage",
      type_de_diplome: "BAC PRO",
    });
  });

  it("Vérifie qu'on peut ajouter les données du fichier national inserJeunes (pro)", async () => {
    const input =
      createStream(`Code Formation;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme rénové ou nouveau;Taux de poursuite d'études;nb en poursuite d'études;nb en année terminale;Taux d'emploi 6 mois après la sortie;nb en emploi 6 mois après la sortie;nb de sortants 6 mois après la sortie;Taux d'emploi 12 mois après la sortie;nb en emploi 12 mois après la sortie
    "23830022105";BAC PRO;boulanger-pâtissier;"3";non;"62";"746";"1197";"44";"200";"451";"58";"263"`);

    const stats = await importInserJeunesNationalData({ input, type: "pro", millesime: "2020-2019" });

    assert.deepStrictEqual(stats, { created: 1, failed: 0, total: 1, updated: 0 });

    const docs = await dbCollection("inserJeunesNationals")
      .find({}, { projection: { _id: 0 } })
      .toArray();

    assert.strictEqual(docs.length, 1);
    assert.deepStrictEqual(docs[0], {
      code_formation: "23830022105",
      libelle_de_la_formation: "boulanger-pâtissier",
      millesime: "2020-2019",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 3,
      nb_en_annee_terminale: 1197,
      nb_en_emploi_12_mois_apres_la_sortie: 263,
      nb_en_emploi_6_mois_apres_la_sortie: 200,
      nb_en_poursuite_etudes: 746,
      nb_sortants_6_mois_apres_la_sortie: 451,
      taux_de_poursuite_etudes: 62,
      taux_emploi_12_mois_apres_la_sortie: 58,
      taux_emploi_6_mois_apres_la_sortie: 44,
      type: "pro",
      type_de_diplome: "BAC PRO",
    });
  });

  it("Vérifie qu'on peut mettre à jour des données", async () => {
    await importInserJeunesNationalData({
      millesime: "2022-2021",
      type: "pro",
      input:
        createStream(`Code Formation;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme rénové ou nouveau;Taux de poursuite d'études;nb en poursuite d'études;nb en année terminale;Taux d'emploi 6 mois après la sortie;nb en emploi 6 mois après la sortie;nb de sortants 6 mois après la sortie;Taux d'emploi 12 mois après la sortie;nb en emploi 12 mois après la sortie
        "40023303";BAC PRO;menuiserie aluminium-verre;"3";non;"22";"11";"49";"66";"25";"38";"82";"31"`),
    });

    const stats = await importInserJeunesNationalData({
      millesime: "2022-2021",
      type: "pro",
      input:
        createStream(`Code Formation;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme rénové ou nouveau;Taux de poursuite d'études;nb en poursuite d'études;nb en année terminale;Taux d'emploi 6 mois après la sortie;nb en emploi 6 mois après la sortie;nb de sortants 6 mois après la sortie;Taux d'emploi 12 mois après la sortie;nb en emploi 12 mois après la sortie
        "40023303";BAC PRO;Nouveau libellé formation;"3";non;"22";"11";"49";"66";"25";"38";"82";"31"`),
    });

    assert.deepStrictEqual(stats, { created: 0, failed: 0, total: 1, updated: 1 });
    const found = await dbCollection("inserJeunesNationals").findOne();
    assert.strictEqual(found.libelle_de_la_formation, "Nouveau libellé formation");
  });

  it("Vérifie qu'on écrase pas si les données sont déjà à jour", async () => {
    await importInserJeunesNationalData({
      millesime: "2022-2021",
      type: "pro",
      input:
        createStream(`Code Formation;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme rénové ou nouveau;Taux de poursuite d'études;nb en poursuite d'études;nb en année terminale;Taux d'emploi 6 mois après la sortie;nb en emploi 6 mois après la sortie;nb de sortants 6 mois après la sortie;Taux d'emploi 12 mois après la sortie;nb en emploi 12 mois après la sortie
        "40023303";BAC PRO;menuiserie aluminium-verre;"3";non;"22";"11";"49";"66";"25";"38";"82";"31"`),
    });

    const stats = await importInserJeunesNationalData({
      millesime: "2022-2021",
      type: "pro",
      input:
        createStream(`Code Formation;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme rénové ou nouveau;Taux de poursuite d'études;nb en poursuite d'études;nb en année terminale;Taux d'emploi 6 mois après la sortie;nb en emploi 6 mois après la sortie;nb de sortants 6 mois après la sortie;Taux d'emploi 12 mois après la sortie;nb en emploi 12 mois après la sortie
        "40023303";BAC PRO;menuiserie aluminium-verre;"3";non;"22";"11";"49";"66";"25";"38";"82";"31"`),
    });

    assert.deepStrictEqual(stats, { created: 0, failed: 0, total: 1, updated: 0 });
    const found = await dbCollection("inserJeunesNationals").findOne();
    assert.strictEqual(found.libelle_de_la_formation, "menuiserie aluminium-verre");
  });
});
