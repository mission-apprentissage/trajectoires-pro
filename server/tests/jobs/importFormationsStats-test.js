import assert from "assert";
import { omit } from "lodash-es";
import { importFormationsStats } from "../../src/jobs/importFormationsStats.js";
import { createStream } from "../utils/testUtils.js";
import { mockInserJeunesApi } from "../utils/apiMocks.js";
import { insertCertifications, insertFormationsStats } from "../utils/fakeData.js";
import { formationsStats } from "../../src/common/collections/index.js";

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
    await insertCertifications({
      code_formation: "12345678",
      diplome: {
        code: "4",
        label: "BAC",
      },
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_formation: "12345678",
      certification: {
        code_formation: "12345678",
        alias: [],
        diplome: {
          code: "4",
          label: "BAC",
        },
      },
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
    await insertCertifications({
      code_formation: "12345678",
      alias: [
        {
          code: "4746640400",
          type: "mef",
        },
        {
          code: "084621214",
          type: "mef_stat_9",
        },
        {
          code: "90517039856",
          type: "mef_stat_11",
        },
        {
          code: "97302570",
          type: "code_formation_ancien",
        },
      ],
      diplome: {
        code: "4",
        label: "BAC",
      },
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_formation: "12345678",
      millesime: "2018_2019",
      filiere: "pro",
      taux_emploi_6_mois: 6,
      certification: {
        code_formation: "12345678",
        alias: [
          {
            code: "4746640400",
            type: "mef",
          },
          {
            code: "084621214",
            type: "mef_stat_9",
          },
          {
            code: "90517039856",
            type: "mef_stat_11",
          },
          {
            code: "97302570",
            type: "code_formation_ancien",
          },
        ],
        diplome: {
          code: "4",
          label: "BAC",
        },
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une formation avec un code alternatif", async () => {
    let input = createStream(`uai\n0751234J`);
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "taux_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "CODE_FORMATION",
            },
          ],
        },
      ],
    });
    await insertCertifications({
      code_formation: "12345678",
      alias: [{ type: "code_formation_ancien", code: "CODE_FORMATION" }],
      diplome: {
        code: "4",
        label: "BAC",
      },
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_formation: "CODE_FORMATION",
      certification: {
        code_formation: "12345678",
        alias: [{ type: "code_formation_ancien", code: "CODE_FORMATION" }],
        diplome: {
          code: "4",
          label: "BAC",
        },
      },
      millesime: "2018_2019",
      filiere: "apprentissage",
      taux_emploi_6_mois: 6,
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats sans certification", async () => {
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

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await formationsStats().findOne({}, { projection: { _id: 0 } });
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

    let found = await formationsStats().findOne({}, { projection: { _id: 0 } });
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

    let found = await formationsStats().findOne({ code_formation: "12345678" });
    assert.strictEqual(found.taux_emploi_6_mois, 6);
    found = await formationsStats().findOne({ code_formation: "87456123" });
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

    let found = await formationsStats().findOne({ millesime: "2018_2019" });
    assert.strictEqual(found.taux_emploi_6_mois, 6);
    found = await formationsStats().findOne({ millesime: "2020_2021" });
    assert.strictEqual(found.taux_emploi_6_mois, 8);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats d'une formation", async () => {
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
    await insertFormationsStats({
      uai: "0751234J",
      code_formation: "12345678",
      millesime: "2018_2019",
      taux_emploi_6_mois: -1,
    });

    let stats = await importFormationsStats({ input, millesimes: ["2018_2019"] });

    let found = await formationsStats().findOne({}, { projection: { _id: 0 } });
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

    let count = await formationsStats().countDocuments({});
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

    let count = await formationsStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });
});
