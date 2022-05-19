import assert from "assert";
import { omit } from "lodash-es";
import { importFormationsStats } from "../../src/jobs/importFormationsStats.js";
import { createStream } from "../utils/testUtils.js";
import { dbCollection } from "../../src/common/mongodb.js";
import { mockInserJeunesApi } from "../utils/apiMocks.js";
import { insertFormationsStats } from "../utils/fakeData.js";

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

  it("Vérifie qu'on peut importer les stats d'une formation (apprentissage)", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019");

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("formationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_formation: "12345678",
      millesime: "2018_2019",
      filiere: "apprentissage",
      taux_emploi_6_mois: 6,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une formation (pro)", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678",
            },
          ],
        },
      ],
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("formationsStats").findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_formation: "12345678",
      millesime: "2018_2019",
      filiere: "pro",
      taux_emploi_6_mois: 6,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on fusionne les mesures d'une formation", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678",
            },
          ],
        },
        {
          id_mesure: "taux_emploi_12_mois",
          valeur_mesure: 12,
          dimensions: [
            {
              id_mefstat11: "12345678",
            },
          ],
        },
      ],
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("formationsStats").findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.taux_emploi_6_mois, 6);
    assert.strictEqual(found.taux_emploi_12_mois, 12);
    assert.ok(found._meta.date_import);
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
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 8,
          dimensions: [
            {
              id_formation_apprentissage: "87456123",
            },
          ],
        },
      ],
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await dbCollection("formationsStats").findOne({ code_formation: "12345678" });
    assert.strictEqual(found.taux_emploi_6_mois, 6);
    found = await dbCollection("formationsStats").findOne({ code_formation: "87456123" });
    assert.strictEqual(found.taux_emploi_6_mois, 8);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une formation sur plusieurs millesimes", async () => {
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
      ],
    });
    mockApi("0751234J", "2020_2021", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 8,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019", "2020_2021"] });

    let found = await dbCollection("formationsStats").findOne({ millesime: "2018_2019" });
    assert.strictEqual(found.taux_emploi_6_mois, 6);
    found = await dbCollection("formationsStats").findOne({ millesime: "2020_2021" });
    assert.strictEqual(found.taux_emploi_6_mois, 8);
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

  it("Vérifie qu'on peut gèrer les erreurs 400 de l'api", async () => {
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

    let count = await dbCollection("formationsStats").countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });

  it("Vérifie qu'on peut gèrer un json invalide", async () => {
    let input = createStream(`uai\n0751234J`);
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/0751234J/millesime/2018_2019`)
        .query(() => true)
        .reply(200, "{json:");
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let count = await dbCollection("formationsStats").countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });
});
