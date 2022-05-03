const assert = require("assert");
const importInsertJeunes = require("../../src/jobs/importInsertJeunes");
const { createStream } = require("../utils/testUtils");
const { dbCollection } = require("../../src/common/mongodb");

describe("importInsertJeunes", () => {
  it("Vérifie qu'on peut ajouter les données du fichier insertJeunes (apprentissage)", async () => {
    let input =
      createStream(`n°UAI de l'établissement;Libellé de l'établissement;Région;Code formation apprentissage;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme renové ou nouveau;Taux de poursuite d'études;Taux d'emploi 6 mois après la sortie;Taux d'emploi 12 mois après la sortie
0751234J;Centre de Formation;AUVERGNE-RHONE-ALPES;1022105;MC5;cuisinier en desserts de restaurant;1;non;42;50;58
`);

    let stats = await importInsertJeunes({ input, millesime: "2022-2021" });

    assert.deepStrictEqual(stats, { created: 1, failed: 0, total: 1, updated: 0 });

    let docs = await dbCollection("insertJeunes")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    assert.strictEqual(docs.length, 1);
    assert.deepStrictEqual(docs[0], {
      millesime: "2022-2021",
      code_formation: "1022105",
      type: "apprentissage",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 1,
      libelle_de_etablissement: "Centre de Formation",
      libelle_de_la_formation: "cuisinier en desserts de restaurant",
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      taux_de_poursuite_etudes: 42,
      taux_emploi_12_mois_apres_la_sortie: 58,
      taux_emploi_6_mois_apres_la_sortie: 50,
      type_de_diplome: "MC5",
      uai_de_etablissement: "0751234J",
    });
  });

  it("Vérifie qu'on peut ajouter les données du fichier insertJeunes (pro)", async () => {
    let input =
      createStream(`n°UAI de l'établissement;Libellé de l'établissement;Région;Code formation Mefstat11;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme renové ou nouveau;Taux de poursuite d'études;Taux d'emploi 6 mois après la sortie;Taux d'emploi 12 mois après la sortie
0751234J;Centre de Formation;ILE-DE-FRANCE;23830025007;BAC PRO;maintenance des equipements industriels;3;non;42;50;
`);

    let stats = await importInsertJeunes({ input, millesime: "2022-2021" });

    assert.deepStrictEqual(stats, { created: 1, failed: 0, total: 1, updated: 0 });

    let docs = await dbCollection("insertJeunes")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    assert.strictEqual(docs.length, 1);
    assert.deepStrictEqual(docs[0], {
      millesime: "2022-2021",
      code_formation: "23830025007",
      type: "pro",
      diplome_renove_ou_nouveau: "non",
      duree_de_formation: 3,
      libelle_de_etablissement: "Centre de Formation",
      libelle_de_la_formation: "maintenance des equipements industriels",
      region: {
        code: "11",
        nom: "Île-de-France",
      },
      taux_de_poursuite_etudes: 42,
      taux_emploi_6_mois_apres_la_sortie: 50,
      type_de_diplome: "BAC PRO",
      uai_de_etablissement: "0751234J",
    });
  });

  it("Vérifie qu'on peut mettre à jour des données", async () => {
    await importInsertJeunes({
      millesime: "2022-2021",
      input:
        createStream(`n°UAI de l'établissement;Libellé de l'établissement;Région;Code formation Mefstat11;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme renové ou nouveau;Taux de poursuite d'études;Taux d'emploi 6 mois après la sortie;Taux d'emploi 12 mois après la sortie
0751234J;Centre de Formation;ILE-DE-FRANCE;23830025007;BAC PRO;maintenance des equipements industriels;3;non;42;50;58
`),
    });

    let stats = await importInsertJeunes({
      millesime: "2022-2021",
      input:
        createStream(`n°UAI de l'établissement;Libellé de l'établissement;Région;Code formation Mefstat11;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme renové ou nouveau;Taux de poursuite d'études;Taux d'emploi 6 mois après la sortie;Taux d'emploi 12 mois après la sortie
0751234J;Nouveau Centre de Formation;ILE-DE-FRANCE;23830025007;BAC PRO;maintenance des equipements industriels;3;non;42;50;58
`),
    });

    assert.deepStrictEqual(stats, { created: 0, failed: 0, total: 1, updated: 1 });
    let found = await dbCollection("insertJeunes").findOne();
    assert.strictEqual(found.libelle_de_etablissement, "Nouveau Centre de Formation");
  });

  it("Vérifie qu'on gère des lignes invalides", async () => {
    let input =
      createStream(`n°UAI de l'établissement;Libellé de l'établissement;Région;Code formation Mefstat11;Type de diplôme;Libellé de la formation;Durée de formation (en année);Diplôme renové ou nouveau;Taux de poursuite d'études;Taux d'emploi 6 mois après la sortie;Taux d'emploi 12 mois après la sortie
0751234J;Centre de Formation;INVALID;23830025007;BAC PRO;maintenance des equipements industriels;3;non;42;50;58
`);

    let stats = await importInsertJeunes({ input, millesime: "2022-2021" });

    assert.deepStrictEqual(stats, { created: 0, failed: 1, total: 1, updated: 0 });
  });
});
