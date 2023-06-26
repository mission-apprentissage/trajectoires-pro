import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import MockDate from "mockdate";
import { importRegionalesStats } from "../../src/jobs/importRegionalesStats.js";
import { mockInserJeunesApi } from "../utils/apiMocks.js";
import { insertCFD, insertMEF, insertRegionalesStats } from "../utils/fakeData.js";
import { pickBy } from "lodash-es";
import { regionalesStats } from "../../src/common/db/collections/collections.js";

chai.use(chaiAsPromised);

describe("importRegionalesStats", () => {
  function mockApi(millesime, region, response) {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/region/${region}/millesime/${millesime}`)
        .query(() => true)
        .reply(200, responses.regionales(response));
    });
  }

  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les stats d'une région (apprentissage)", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          filiere: "apprentissage",
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          //ignored
          id_mesure: "taux_poursuite_etudes",
          valeur_mesure: 6,
          filiere: "apprentissage",
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
    });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      millesime: "2020_2021",
      filiere: "apprentissage",
      nb_en_emploi_6_mois: 6,
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      region: {
        code: "84",
        code_region_academique: "01",
        nom: "Auvergne-Rhône-Alpes",
      },
      _meta: {
        inserjeunes: {
          taux_poursuite_etudes: 6,
        },
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une région (voie scolaire)", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      filiere: "pro",
      millesime: "2020_2021",
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      nb_en_emploi_6_mois: 6,
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      region: {
        code: "84",
        code_region_academique: "01",
        nom: "Auvergne-Rhône-Alpes",
      },
      _meta: {
        inserjeunes: {},
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on ignore les stats d'une région (voie scolaire agricole)", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "voie_pro_sco_agri",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, null);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 0 });
  });

  it("Vérifie que l'on a une erreur si la filière est inconnue", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "inconnu",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, null);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });

  it("Vérifie qu'on peut recalcule les taux", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 10,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_poursuite_etudes",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 50,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_annee_term",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 100,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    const taux = pickBy(found, (value, key) => key.startsWith("taux"));
    assert.deepStrictEqual(taux, {
      taux_autres_6_mois: 40,
      taux_en_emploi_6_mois: 10,
      taux_en_formation: 50,
    });
  });

  it("Vérifie que l'on arrondit correctement les taux", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 13,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_poursuite_etudes",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 11,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_annee_term",
          filiere: "voie_pro_sco_educ_nat",
          valeur_mesure: 40,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    const taux = pickBy(found, (value, key) => key.startsWith("taux"));
    assert.deepStrictEqual(taux, {
      taux_autres_6_mois: 40,
      taux_en_emploi_6_mois: 32,
      taux_en_formation: 28,
    });
    assert.equal(taux.taux_autres_6_mois + taux.taux_en_emploi_6_mois + taux.taux_en_formation, 100);
  });

  it("Vérifie qu'on fusionne les mesures pour une même certification", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "apprentissage",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          id_mesure: "nb_en_emploi_12_mois",
          filiere: "apprentissage",
          valeur_mesure: 12,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678" });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 6);
    assert.deepStrictEqual(found.nb_en_emploi_12_mois, 12);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une région sur plusieurs millesimes", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "apprentissage",
          valeur_mesure: 20,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    mockApi("2019_2020", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "apprentissage",
          valeur_mesure: 19,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678" });

    await importRegionalesStats({ millesimes: ["2019_2020", "2020_2021"], codes_region_academique: ["01"] });

    let found = await regionalesStats().findOne({ millesime: "2019_2020" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 19);

    found = await regionalesStats().findOne({ millesime: "2020_2021" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 20);
  });

  it("Vérifie qu'on peut importer les stats de plusieurs régions", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "apprentissage",
          valeur_mesure: 20,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    mockApi("2020_2021", "02", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          filiere: "apprentissage",
          valeur_mesure: 19,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678", code_formation_diplome: "48286940" });

    await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01", "02"] });

    let found = await regionalesStats().findOne(
      { millesime: "2020_2021", "region.code_region_academique": "01" },
      { projection: { _id: 0 } }
    );
    assert.deepStrictEqual(found, {
      code_certification: "12345678",
      code_formation_diplome: "48286940",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      filiere: "apprentissage",
      millesime: "2020_2021",
      nb_en_emploi_6_mois: 20,
      region: {
        code: "84",
        code_region_academique: "01",
        nom: "Auvergne-Rhône-Alpes",
      },
      _meta: {
        inserjeunes: {},
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });

    found = await regionalesStats().findOne(
      { millesime: "2020_2021", "region.code_region_academique": "02" },
      { projection: { _id: 0 } }
    );
    assert.deepStrictEqual(found, {
      code_certification: "12345678",
      code_formation_diplome: "48286940",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      filiere: "apprentissage",
      millesime: "2020_2021",
      nb_en_emploi_6_mois: 19,
      region: {
        code: "27",
        code_region_academique: "02",
        nom: "Bourgogne-Franche-Comté",
      },
      _meta: {
        inserjeunes: {},
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });
  });

  it("Vérifie qu'on peut importer les stats de plusieurs certifications", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_12_mois",
          filiere: "apprentissage",
          valeur_mesure: 12,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          id_mesure: "nb_en_emploi_12_mois",
          filiere: "apprentissage",
          valeur_mesure: 13,
          dimensions: [
            {
              id_formation_apprentissage: "67890",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678" });
    await insertCFD({ code_certification: "67890" });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    let found = await regionalesStats().findOne({ code_certification: "12345678" });
    assert.deepStrictEqual(found.nb_en_emploi_12_mois, 12);
    found = await regionalesStats().findOne({ code_certification: "67890" });
    assert.deepStrictEqual(found.nb_en_emploi_12_mois, 13);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats d'une certification", async () => {
    mockApi("2020_2021", "01", {
      data: [
        {
          id_mesure: "nb_en_emploi_12_mois",
          filiere: "apprentissage",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertRegionalesStats({
      millesime: "2020_2021",
      code_certification: "12345678",
      filiere: "apprentissage",
      region: {
        code: "84",
        code_region_academique: "01",
        nom: "Auvergne-Rhône-Alpes",
      },
      nb_en_emploi_12_mois: -1,
    });

    const stats = await importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["01"] });

    const found = await regionalesStats().findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.nb_en_emploi_12_mois, 6);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 1 });
  });

  it("Vérifie que l'on retourne une erreur si le code région académique n'est pas valide", async () => {
    await assert.isRejected(
      importRegionalesStats({ millesimes: ["2020_2021"], codes_region_academique: ["INCONNU"] }),
      Error,
      "Code région académique INCONNU inconnu"
    );
  });

  it("Vérifie qu'on peut gèrer les erreurs 400 de l'api", async () => {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/region/01/millesime/2018_2019`)
        .query(() => true)
        .reply(400, { msg: "millesime incorrect" });

      client
        .get(`/region/02/millesime/2018_2019`)
        .query(() => true)
        .reply(400, { msg: "Region académique incorrecte" });
    });

    const stats = await importRegionalesStats({
      inserjeunesOptions: { apiOptions: { retry: { minTimeout: 0 } } },
      millesimes: ["2018_2019"],
      codes_region_academique: ["01", "02"],
    });

    const count = await regionalesStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 2, updated: 0 });
  });

  it("Vérifie qu'on peut gèrer un json invalide", async () => {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/region/01/millesime/2020_2021`)
        .query(() => true)
        .reply(200, "{json:", {
          "Content-Type": "application/json",
        });
    });

    const stats = await importRegionalesStats({
      inserjeunesOptions: { apiOptions: { retry: { minTimeout: 0 } } },
      millesimes: ["2020_2021"],
      codes_region_academique: ["01"],
    });

    const count = await regionalesStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });
});
