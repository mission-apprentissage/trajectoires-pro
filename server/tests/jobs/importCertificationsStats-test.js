const assert = require("assert");
const importCertificationsStats = require("../../src/jobs/importCertificationsStats");
const { dbCollection } = require("../../src/common/mongodb");
const { mockInserJeunesApi } = require("../utils/apiMocks");
const { insertCertificationsStats } = require("../utils/fakeData");
const { omit } = require("lodash");

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

  it("Vérifie qu'on peut importer les stats d'une certification (apprentissage)", async () => {
    mockApi("2020", "apprentissage");

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    let found = await dbCollection("certificationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      millesime: "2020",
      code_formation: "12345",
      filiere: "apprentissage",
      taux_emploi_6_mois: 6,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une certification (pro)", async () => {
    mockApi("2020", "voie_pro_sco_educ_nat", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345",
            },
          ],
        },
      ],
    });

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["voie_pro_sco_educ_nat"] });

    let found = await dbCollection("certificationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      millesime: "2020",
      code_formation: "12345",
      filiere: "pro",
      taux_emploi_6_mois: 6,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on fusionne les mesures pour une même certification", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345",
            },
          ],
        },
        {
          id_mesure: "taux_emploi_12_mois",
          valeur_mesure: 12,
          dimensions: [
            {
              id_formation_apprentissage: "12345",
            },
          ],
        },
      ],
    });

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    let found = await dbCollection("certificationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.taux_emploi_6_mois, 6);
    assert.deepStrictEqual(found.taux_emploi_12_mois, 12);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une certification sur plusieurs millesimes", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 20,
          dimensions: [
            {
              id_formation_apprentissage: "12345",
            },
          ],
        },
      ],
    });
    mockApi("2019", "apprentissage", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 19,
          dimensions: [
            {
              id_formation_apprentissage: "12345",
            },
          ],
        },
      ],
    });

    await importCertificationsStats({ millesimes: ["2019", "2020"], filieres: ["apprentissage"] });

    let found = await dbCollection("certificationsStats").findOne({ millesime: "2019" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.taux_emploi_6_mois, 19);

    found = await dbCollection("certificationsStats").findOne({ millesime: "2020" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.taux_emploi_6_mois, 20);
  });

  it("Vérifie qu'on peut importer les stats de plusieurs certifications", async () => {
    mockApi("2020", "apprentissage", {
      data: [
        {
          id_mesure: "taux_emploi_12_mois",
          valeur_mesure: 12,
          dimensions: [
            {
              id_formation_apprentissage: "12345",
            },
          ],
        },
        {
          id_mesure: "taux_emploi_12_mois",
          valeur_mesure: 13,
          dimensions: [
            {
              id_formation_apprentissage: "67890",
            },
          ],
        },
      ],
    });

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    let found = await dbCollection("certificationsStats").findOne({ code_formation: "12345" });
    assert.deepStrictEqual(found.taux_emploi_12_mois, 12);
    found = await dbCollection("certificationsStats").findOne({ code_formation: "67890" });
    assert.deepStrictEqual(found.taux_emploi_12_mois, 13);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats d'une certification", async () => {
    mockApi("2020", "apprentissage");
    await insertCertificationsStats({
      millesime: "2020",
      code_formation: "12345",
      filiere: "apprentissage",
      taux_emploi_6_mois: -1,
    });

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["apprentissage"] });

    let found = await dbCollection("certificationsStats").findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.taux_emploi_6_mois, 6);
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

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["inconnue"] });

    let count = await dbCollection("certificationsStats").countDocuments({});
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

    let stats = await importCertificationsStats({ millesimes: ["2020"], filieres: ["inconnue"] });

    let count = await dbCollection("certificationsStats").countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });
});