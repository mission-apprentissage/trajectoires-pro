import assert from "assert";
import MockDate from "mockdate";
import { importCertificationsStats } from "#src/jobs/stats/importCertificationsStats.js";
import { mockInserJeunesApi } from "#tests/utils/apiMocks.js";
import { insertCFD, insertCertificationsStats, insertMEF } from "#tests/utils/fakeData.js";
import { pickBy } from "lodash-es";
import { certificationsStats } from "#src/common/db/collections/collections.js";

describe("importCertificationsStats", () => {
  function mockApi(millesime, filiere, response) {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/france/millesime/${millesime}/filiere/${filiere}`)
        .query(() => true)
        .reply(200, responses.certifications(response));
    });
  }

  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les stats d'une certification (apprentissage)", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
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

    const stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    const found = await certificationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      millesime: "2020",
      filiere: "apprentissage",
      nb_en_emploi_6_mois: 6,
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      donnee_source: {
        code_certification: "12345678",
        type: "self",
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

  it("Vérifie qu'on peut importer les stats d'une certification (mefstats11)", async () => {
    mockApi("2020", "voie_pro_sco_educ_nat", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
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

    const stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["voie_pro_sco_educ_nat"] });

    const found = await certificationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      filiere: "pro",
      millesime: "2020",
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      nb_en_emploi_6_mois: 6,
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      donnee_source: {
        code_certification: "12345678900",
        type: "self",
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

  it("Vérifie qu'on peut recalcule les taux", async () => {
    mockApi("2020", "voie_pro_sco_educ_nat", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 10,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_poursuite_etudes",
          valeur_mesure: 50,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_annee_term",
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

    await importCertificationsStats({ millesimes: ["2020"], filieres: ["voie_pro_sco_educ_nat"] });

    const found = await certificationsStats().findOne({}, { projection: { _id: 0 } });
    const taux = pickBy(found, (value, key) => key.startsWith("taux"));
    assert.deepStrictEqual(taux, {
      taux_autres_6_mois: 40,
      taux_en_emploi_6_mois: 10,
      taux_en_formation: 50,
    });
  });

  it("Vérifie que l'on arrondit correctement les taux", async () => {
    mockApi("2020", "voie_pro_sco_educ_nat", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 13,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_poursuite_etudes",
          valeur_mesure: 11,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_annee_term",
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

    await importCertificationsStats({ millesimes: ["2020"], filieres: ["voie_pro_sco_educ_nat"] });

    const found = await certificationsStats().findOne({}, { projection: { _id: 0 } });
    const taux = pickBy(found, (value, key) => key.startsWith("taux"));
    assert.deepStrictEqual(taux, {
      taux_autres_6_mois: 40,
      taux_en_emploi_6_mois: 32,
      taux_en_formation: 28,
    });
    assert.equal(taux.taux_autres_6_mois + taux.taux_en_emploi_6_mois + taux.taux_en_formation, 100);
  });

  it("Vérifie qu'on fusionne les mesures pour une même certification", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          id_mesure: "nb_en_emploi_12_mois",
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

    const stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    const found = await certificationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 6);
    assert.deepStrictEqual(found.nb_en_emploi_12_mois, 12);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une certification sur plusieurs millesimes", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 20,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    mockApi("2019", "apprentissage", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
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

    await importCertificationsStats({ millesimes: ["2019", "2020"], filieres: ["apprentissage"] });

    let found = await certificationsStats().findOne({ millesime: "2019" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 19);

    found = await certificationsStats().findOne({ millesime: "2020" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 20);
  });

  it("Vérifie qu'on peut importer les stats de plusieurs certifications", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "nb_en_emploi_12_mois",
          valeur_mesure: 12,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          id_mesure: "nb_en_emploi_12_mois",
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

    const stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    let found = await certificationsStats().findOne({ code_certification: "12345678" });
    assert.deepStrictEqual(found.nb_en_emploi_12_mois, 12);
    found = await certificationsStats().findOne({ code_certification: "67890" });
    assert.deepStrictEqual(found.nb_en_emploi_12_mois, 13);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats d'une certification", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "nb_en_emploi_12_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCertificationsStats({
      millesime: "2020",
      code_certification: "12345678",
      filiere: "apprentissage",
      nb_en_emploi_12_mois: -1,
    });

    const stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    const found = await certificationsStats().findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.nb_en_emploi_12_mois, 6);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 1 });
  });

  it("Vérifie qu'on peut gèrer les erreurs 400 de l'api", async () => {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/france/millesime/2020/filiere/inconnue`)
        .query(() => true)
        .reply(400, { msg: "filiere incorrect" });
    });

    const stats = await importCertificationsStats({
      inserjeunesOptions: { apiOptions: { retry: { minTimeout: 0 } } },
      millesimes: ["2020"],
      filieres: ["inconnue"],
    });

    const count = await certificationsStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });

  it("Vérifie qu'on peut gèrer un json invalide", async () => {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/france/millesime/2020/filiere/inconnue`)
        .query(() => true)
        .reply(200, "{json:");
    });

    const stats = await importCertificationsStats({
      inserjeunesOptions: { apiOptions: { retry: { minTimeout: 0 } } },
      millesimes: ["2020"],
      filieres: ["inconnue"],
    });

    const count = await certificationsStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });
});
