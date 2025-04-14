import { assert } from "chai";
import { mockInsersupApi } from "#tests/utils/apiMocks.js";
import MockDate from "mockdate";
import { importFormationsSupStats } from "#src/jobs/stats/importFormationsSupStats.js";
import { insertBCNSise, insertAcceEtablissement } from "#tests/utils/fakeData.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import * as Fixtures from "#tests/utils/fixtures.js";

describe("importFormationsSupStats", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les stats d'une formation (superieur)", async () => {
    const formations = await Fixtures.FormationsInserSup();
    mockInsersupApi(formations);

    await insertBCNSise({
      diplome_sise: "2400074",
    });

    await insertAcceEtablissement({
      numero_uai: "0062205P",
    });

    const stats = await importFormationsSupStats({
      millesimes: ["2021"],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      uai: "0062205P",
      code_certification: "2400074",
      code_certification_type: "sise",
      libelle: "METIERS DE L'ENSEIGNEMENT",
      libelle_etablissement: "UNIVERSITE COTE D'AZUR",
      millesime: "2021",
      filiere: "superieur",
      date_fermeture: new Date("2023-01-01T00:00:00.000Z"),
      nb_diplome: 101,
      nb_annee_term: 119,
      nb_en_emploi_12_mois: 25,
      nb_en_emploi_18_mois: 26,
      nb_en_emploi_24_mois: 27,
      nb_en_emploi_6_mois: 23,
      nb_poursuite_etudes: 65,
      nb_sortant: 54,
      taux_autres_12_mois: 24,
      taux_autres_18_mois: 23,
      taux_autres_24_mois: 22,
      taux_autres_6_mois: 26,
      taux_en_emploi_12_mois: 21,
      taux_en_emploi_18_mois: 22,
      taux_en_emploi_24_mois: 23,
      taux_en_emploi_6_mois: 19,
      taux_en_formation: 55,
      diplome: {
        code: "6",
        libelle: "MAST ENS",
      },
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      academie: { code: "10", nom: "Lyon" },
      donnee_source: {
        code_certification: "2400074",
        type: "self",
      },
      _meta: {
        insersup: {
          discipline: "Sciences économiques",
          domaine_disciplinaire: "DEG",
          etablissement_actuel_libelle: "UNIVERSITE COTE D'AZUR",
          etablissement_libelle: "UNIVERSITE COTE D'AZUR",
          secteur_disciplinaire: "SCIENCES DE GESTION",
          type_diplome: "licence_pro",
        },
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });

    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une formation (superieur) pour des millésimes simples et aggrégé", async () => {
    const formations = await Fixtures.FormationsInserSupMillesimesMixtes();
    mockInsersupApi(formations);

    await insertBCNSise({
      diplome_sise: "2400074",
    });
    await insertBCNSise({
      diplome_sise: "2400075",
    });

    await insertAcceEtablissement({
      numero_uai: "0062205P",
    });

    const stats = await importFormationsSupStats({
      millesimes: ["2020_2021"],
    });

    const found = await formationsStats().findOne({ millesime: "2020_2021" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      uai: "0062205P",
      code_certification: "2400075",
      code_certification_type: "sise",
      libelle: "METIERS DE L'ENSEIGNEMENT",
      libelle_etablissement: "UNIVERSITE COTE D'AZUR",
      millesime: "2020_2021",
      filiere: "superieur",
      date_fermeture: new Date("2023-01-01T00:00:00.000Z"),
      nb_annee_term: 193,
      nb_en_emploi_12_mois: 112,
      nb_en_emploi_18_mois: 115,
      nb_en_emploi_24_mois: 115,
      nb_en_emploi_6_mois: 110,
      nb_poursuite_etudes: 63,
      nb_sortant: 130,
      nb_diplome: 101,
      taux_autres_12_mois: 9,
      taux_autres_18_mois: 7,
      taux_autres_24_mois: 7,
      taux_autres_6_mois: 10,
      taux_en_emploi_12_mois: 58,
      taux_en_emploi_18_mois: 60,
      taux_en_emploi_24_mois: 60,
      taux_en_emploi_6_mois: 57,
      taux_en_formation: 33,
      diplome: {
        code: "6",
        libelle: "MAST ENS",
      },
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      academie: { code: "10", nom: "Lyon" },
      donnee_source: {
        code_certification: "2400075",
        type: "self",
      },
      _meta: {
        insersup: {
          discipline: "Sciences économiques",
          domaine_disciplinaire: "DEG",
          etablissement_actuel_libelle: "UNIVERSITE COTE D'AZUR",
          etablissement_libelle: "UNIVERSITE COTE D'AZUR",
          secteur_disciplinaire: "SCIENCES DE GESTION",
          type_diplome: "licence_pro",
        },
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });

    const found2 = await formationsStats().findOne({ millesime: "2021" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found2, {
      uai: "0062205P",
      code_certification: "2400074",
      code_certification_type: "sise",
      libelle: "METIERS DE L'ENSEIGNEMENT",
      libelle_etablissement: "UNIVERSITE COTE D'AZUR",
      millesime: "2021",
      filiere: "superieur",
      date_fermeture: new Date("2023-01-01T00:00:00.000Z"),
      nb_diplome: 101,
      nb_annee_term: 119,
      nb_en_emploi_12_mois: 25,
      nb_en_emploi_18_mois: 26,
      nb_en_emploi_24_mois: 27,
      nb_en_emploi_6_mois: 23,
      nb_poursuite_etudes: 65,
      nb_sortant: 54,
      taux_autres_12_mois: 24,
      taux_autres_18_mois: 23,
      taux_autres_24_mois: 22,
      taux_autres_6_mois: 26,
      taux_en_emploi_12_mois: 21,
      taux_en_emploi_18_mois: 22,
      taux_en_emploi_24_mois: 23,
      taux_en_emploi_6_mois: 19,
      taux_en_formation: 55,
      diplome: {
        code: "6",
        libelle: "MAST ENS",
      },
      region: {
        code: "84",
        nom: "Auvergne-Rhône-Alpes",
      },
      academie: { code: "10", nom: "Lyon" },
      donnee_source: {
        code_certification: "2400074",
        type: "self",
      },
      _meta: {
        insersup: {
          discipline: "Sciences économiques",
          domaine_disciplinaire: "DEG",
          etablissement_actuel_libelle: "UNIVERSITE COTE D'AZUR",
          etablissement_libelle: "UNIVERSITE COTE D'AZUR",
          secteur_disciplinaire: "SCIENCES DE GESTION",
          type_diplome: "licence_pro",
        },
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie que l'on a une erreur si un millésime simple et également la dernière année d'un millésime aggrégé", async () => {
    const formations = await Fixtures.FormationsInserSupMillesimesMixtes(true);
    mockInsersupApi(formations);

    await insertBCNSise({
      diplome_sise: "2400074",
    });

    await insertAcceEtablissement({
      numero_uai: "0062205P",
    });

    const stats = await importFormationsSupStats({
      millesimes: ["2020_2021"],
    });

    assert.deepStrictEqual(stats, {
      created: 2,
      failed: 0,
      updated: 0,
      error:
        'Millésime en double pour : {"uai":"0062205P","code_certification":"2400074","filiere":"superieur","millesimes":["2021","2020_2021"]}',
    });
  });
});
