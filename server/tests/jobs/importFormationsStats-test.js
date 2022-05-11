const assert = require("assert");
const importFormationsStats = require("../../src/jobs/importFormationsStats");
const { createStream } = require("../utils/testUtils");
const { dbCollection } = require("../../src/common/mongodb");
const { mockInserJeunesApi } = require("../utils/apiMocks");
const { insertFormationsStats } = require("../utils/fakeData");

describe("importFormationsStats", () => {
  function mockApi(uai, millesime, response) {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/${uai}/millesime/${millesime}`)
        .query(() => true)
        .reply(200, responses.uai(response));
    });
  }

  it("Vérifie qu'on peut importer les stats d'une formation", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019");

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("formationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      uai: "0751234J",
      code_formation: "12345678",
      millesime: "2018_2019",
      filiere: "apprentissage",
      taux_emploi_6_mois: 6,
    });
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats de plusieurs formations", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          id_mesure: "taux_emploi_12_mois",
          valeur_mesure: 20,
          dimensions: [
            {
              id_mefstat11: "87456123",
            },
          ],
        },
      ],
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let docs = await dbCollection("formationsStats")
      .find({}, { projection: { _id: 0 } })
      .toArray();

    assert.deepStrictEqual(docs.find((d) => d.code_formation === "12345678").filiere, "apprentissage");
    assert.deepStrictEqual(docs.find((d) => d.code_formation === "87456123").filiere, "pro");
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats d'une formation", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019");
    await insertFormationsStats({
      uai: "0751234J",
      code_formation: "12345678",
      millesime: "2018_2019",
      taux_emploi_6_mois: -1,
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("formationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.taux_emploi_6_mois, 6);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 1 });
  });

  it("Vérifie qu'on peut gère les erreurs 400 de l'api", async () => {
    let input = createStream(`uai\n0751234J`);
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/0751234J/millesime/2018_2019`)
        .query(() => true)
        .reply(400, { msg: "UAI incorrect ou agricole" });
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let count = await dbCollection("etablissementsStats").countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });
});
