const assert = require("assert");
const importEtablissementsStats = require("../../src/jobs/importEtablissementsStats");
const { createStream } = require("../utils/testUtils");
const { dbCollection } = require("../../src/common/mongodb");
const { mockInsertJeunesApi } = require("../utils/apiMocks");
const { insertEtablissementsStats } = require("../utils/fakeData");

describe("importEtablissementsStats", () => {
  function mockApi(uai, millesime) {
    mockInsertJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/${uai}/millesime/${millesime}`)
        .query(() => true)
        .reply(200, responses.uai());
    });
  }

  it("Vérifie qu'on peut importer les stats de formations pour un établissement", async () => {
    mockApi("0751234J", "2018_2019");
    let input = createStream(`uai\n0751234J`);

    let stats = await importEtablissementsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("etablissementsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      uai: "0751234J",
      formations: [
        {
          code_formation: "12345678",
          millesime: "2018_2019",
          taux_emploi_12_mois: 12,
          taux_emploi_6_mois: 6,
        },
        {
          code_formation: "87456123",
          millesime: "2018_2019",
          taux_emploi_12_mois: 10,
          taux_emploi_6_mois: 20,
        },
      ],
    });
    assert.deepStrictEqual(stats, { created: 1, failed: 0, total: 1, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats de formations pour un établissement", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019");
    insertEtablissementsStats({
      uai: "0751234J",
      formations: [
        {
          code_formation: "12345678",
          millesime: "2018_2019",
          taux_emploi_12_mois: -1,
          taux_emploi_6_mois: -1,
        },
      ],
    });

    let stats = await importEtablissementsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("etablissementsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      uai: "0751234J",
      formations: [
        {
          code_formation: "12345678",
          millesime: "2018_2019",
          taux_emploi_12_mois: 12,
          taux_emploi_6_mois: 6,
        },
        {
          code_formation: "87456123",
          millesime: "2018_2019",
          taux_emploi_12_mois: 10,
          taux_emploi_6_mois: 20,
        },
      ],
    });
    assert.deepStrictEqual(stats, { created: 0, failed: 0, total: 1, updated: 1 });
  });

  it("Vérifie qu'on peut gère les erreurs 400 de l'api", async () => {
    let input = createStream(`uai\n0751234J`);
    mockInsertJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/0751234J/millesime/2018_2019`)
        .query(() => true)
        .reply(400, { msg: "UAI incorrect ou agricole" });
    });

    let stats = await importEtablissementsStats({ input, millesimes: ["2018_2019"] });

    let count = await dbCollection("etablissementsStats").countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, total: 1, updated: 0 });
  });
});
