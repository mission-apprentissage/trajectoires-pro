import { assert } from "chai";
import sinon from "sinon";
import MockDate from "mockdate";
import { importFormationsSupStats } from "#src/jobs/stats/importFormationsSupStats.js";
import { insertBCNSise, insertAcceEtablissement } from "#tests/utils/fakeData.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import { DataEnseignementSupApi } from "#src/services/dataEnseignementSup/DataEnseignementSupApi.js";
import * as Fixtures from "#tests/utils/fixtures.js";

describe("importFormationsSupStats", () => {
  let fetchEtablissementsStub = null;
  let fetchFormationsStub = null;
  async function stubApi(uai, millesime, formations) {
    const etablissements = await Fixtures.EtablissementsInserSup();
    fetchEtablissementsStub = sinon
      .stub(DataEnseignementSupApi.prototype, "fetchEtablissements")
      .resolves(etablissements);
    fetchFormationsStub = sinon.stub(DataEnseignementSupApi.prototype, "fetchEtablissementStats").resolves(formations);
  }

  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  afterEach("restore the stubs", () => {
    fetchEtablissementsStub && fetchEtablissementsStub.restore();
    fetchEtablissementsStub = null;
    fetchFormationsStub && fetchFormationsStub.restore();
    fetchFormationsStub = null;
  });

  it("Vérifie qu'on peut importer les stats d'une formation (superieur)", async () => {
    const formations = await Fixtures.FormationsInserSup(true);
    await stubApi("0062205P", "2020_2021", formations);

    await insertBCNSise({
      diplome_sise: "2500200",
    });

    await insertAcceEtablissement({
      numero_uai: "0062205P",
    });

    const stats = await importFormationsSupStats({
      millesimes: ["2020_2021"],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      uai: "0062205P",
      code_certification: "2500200",
      code_certification_type: "sise",
      libelle: "METIERS DE L'ENSEIGNEMENT",
      millesime: "2020_2021",
      filiere: "superieur",
      date_fermeture: new Date("2023-01-01T00:00:00.000Z"),
      nb_annee_term: 30,
      nb_diplome: 30,
      nb_en_emploi_12_mois: 14,
      nb_en_emploi_18_mois: 13,
      nb_en_emploi_6_mois: 11,
      nb_poursuite_etudes: 8,
      nb_sortant: 22,
      taux_autres_12_mois: 26,
      taux_autres_18_mois: 30,
      taux_autres_6_mois: 36,
      taux_en_emploi_12_mois: 47,
      taux_en_emploi_18_mois: 43,
      taux_en_emploi_6_mois: 37,
      taux_en_formation: 27,
      diplome: {
        code: "6",
        libelle: "MAST ENS",
      },
      region: {
        code: "93",
        nom: "Provence-Alpes-Côte d'Azur",
      },
      academie: { code: "23", nom: "Nice" },
      donnee_source: {
        code_certification: "2500200",
        type: "self",
      },
      _meta: {
        insersup: {
          discipline: "STAPS",
          domaine_disciplinaire: "Sciences, technologies, santé",
          etablissement_actuel_libelle: "Université Côte d'Azur",
          etablissement_libelle: "Université Côte d'Azur",
          secteur_disciplinaire: "STAPS",
          type_diplome: "Master LMD",
        },
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });

    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie que l'on agrège pas les stats si elles sont disponibles par millesime", async () => {
    const formations = await Fixtures.FormationsInserSup(false);
    await stubApi("0062205P", "2020_2021", formations);

    await insertBCNSise({
      diplome_sise: "2500249",
    });

    await insertAcceEtablissement({
      numero_uai: "0062205P",
    });

    const stats = await importFormationsSupStats({
      parameters: [{ millesime: "2020_2021" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, null);

    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 0 });
  });

  // it("Vérifie qu'on agrège les stats si elles sont disponible par millesime", async () => {
  //   const formations = await Fixtures.FormationsInserSup(false);
  //   await stubApi("0062205P", "2020_2021", formations);

  //   await insertBCNSise({
  //     diplome_sise: "2500249",
  //   });

  //   await insertAcceEtablissement({
  //     numero_uai: "0062205P",
  //   });

  //   const stats = await importFormationsSupStats({
  //     parameters: [{ millesime: "2020_2021" }],
  //   });

  //   const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
  //   assert.deepStrictEqual(found, {
  //     uai: "0062205P",
  //     code_certification: "2500249",
  //     code_certification_type: "sise",
  //     libelle: "METIERS DE L'ENSEIGNEMENT",
  //     millesime: "2020_2021",
  //     filiere: "superieur",
  //     date_fermeture: new Date("2023-01-01T00:00:00.000Z"),
  //     nb_annee_term: 272,
  //     nb_diplome: 272,
  //     nb_en_emploi_12_mois: 195,
  //     nb_en_emploi_18_mois: 211,
  //     nb_en_emploi_6_mois: 188,
  //     nb_poursuite_etudes: 35,
  //     nb_sortant: 237,
  //     taux_autres_12_mois: 15,
  //     taux_autres_18_mois: 9,
  //     taux_autres_6_mois: 18,
  //     taux_en_emploi_12_mois: 72,
  //     taux_en_emploi_18_mois: 78,
  //     taux_en_emploi_6_mois: 69,
  //     taux_en_formation: 13,
  //     diplome: {
  //       code: "6",
  //       libelle: "MAST ENS",
  //     },
  //     region: {
  //       code: "93",
  //       nom: "Provence-Alpes-Côte d'Azur",
  //     },
  //     academie: { code: "23", nom: "Nice" },
  //     donnee_source: {
  //       code_certification: "2500249",
  //       type: "self",
  //     },
  //     _meta: {
  //       insersup: {
  //         discipline: "Sciences humaines et sociales",
  //         domaine_disciplinaire: "Sciences humaines et sociales",
  //         etablissement_actuel_libelle: "Université Côte d'Azur",
  //         etablissement_libelle: "Université Côte d'Azur",
  //         secteur_disciplinaire: "Sciences de l'éducation",
  //         type_diplome: "Master MEEF",
  //       },
  //       created_on: new Date("2023-01-01T00:00:00.000Z"),
  //       updated_on: new Date("2023-01-01T00:00:00.000Z"),
  //       date_import: new Date("2023-01-01T00:00:00.000Z"),
  //     },
  //   });

  //   assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  // });

  it("Vérifie qu'on n'agrège pas les stats si elles ne sont disponible que pour un millesime", async () => {
    const formations = await Fixtures.FormationsInserSupInvalid();
    await stubApi("0062205P", "2020_2021", formations);

    await insertBCNSise({
      diplome_sise: "2500249",
    });

    await insertAcceEtablissement({
      numero_uai: "0062205P",
    });

    const stats = await importFormationsSupStats({
      parameters: [{ millesime: "2020_2021" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, null);

    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 0 });
  });
});
