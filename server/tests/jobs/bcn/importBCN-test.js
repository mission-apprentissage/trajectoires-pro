import assert from "assert";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import { importBCN } from "#src/jobs/bcn/importBCN.js";
import { bcn } from "#src/common/db/collections/collections.js";
import { mockBCN } from "#tests/utils/apiMocks.js";
import * as Fixtures from "#tests/utils/fixtures.js";

describe("importBCN", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les mefs", async () => {
    await mockBCN(async (client) => {
      client
        .get("/nomenclature/N_NIVEAU_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_NIVEAU_FORMATION_DIPLOME"));

      client.get("/nomenclature/N_MEF?schema=consultation").reply(200, await Fixtures.BCN("N_MEF"));

      client
        .get("/nomenclature/V_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("V_FORMATION_DIPLOME_EMPTY"));

      client
        .get("/nomenclature/N_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_FORMATION_DIPLOME_EMPTY"));
    });

    let stats = await importBCN();

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      type: "mef",
      code_certification: "99999999911",
      code_formation_diplome: "40023203",
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      date_ouverture: new Date("2022-07-31T00:00:00.000Z"),
      diplome: { code: "4", libelle: "BAC PRO" },
      libelle: "BAC PRO",
      libelle_long: "BAC PRO",
      ancien_diplome: [],
      nouveau_diplome: [],
      _meta: {
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });

  it("Vérifie qu'on peut importer un mef avec diplome inconnu", async () => {
    await mockBCN(async (client) => {
      client
        .get("/nomenclature/N_NIVEAU_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_NIVEAU_FORMATION_DIPLOME"));

      client.get("/nomenclature/N_MEF?schema=consultation").reply(200, await Fixtures.BCN("N_MEF_DIPLOME_INCONNU"));

      client
        .get("/nomenclature/V_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("V_FORMATION_DIPLOME_EMPTY"));

      client
        .get("/nomenclature/N_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_FORMATION_DIPLOME_EMPTY"));
    });

    let stats = await importBCN();

    let found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });

  it("Vérifie qu'on peut importer les CFD (V_FORMATION_DIPLOME)", async () => {
    await mockBCN(async (client) => {
      client
        .get("/nomenclature/N_NIVEAU_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_NIVEAU_FORMATION_DIPLOME"));

      client.get("/nomenclature/N_MEF?schema=consultation").reply(200, await Fixtures.BCN("N_MEF_EMPTY"));

      client
        .get("/nomenclature/V_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("V_FORMATION_DIPLOME"));

      client
        .get("/nomenclature/N_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_FORMATION_DIPLOME_EMPTY"));
    });

    let stats = await importBCN();

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      type: "cfd",
      code_certification: "40023203",
      code_formation_diplome: "40023203",
      libelle: "BAC PRO BATIMENT",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2022-07-31T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC PRO",
      },
      ancien_diplome: [],
      nouveau_diplome: [],
      niveauFormationDiplome: "403",
      groupeSpecialite: "4",
      lettreSpecialite: "T",
      _meta: {
        created_on: new Date("2023-01-01T00:00:00.000Z"),
        updated_on: new Date("2023-01-01T00:00:00.000Z"),
        date_import: new Date("2023-01-01T00:00:00.000Z"),
      },
    });
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });

  it("Vérifie qu'on peut importer les CFD (N_FORMATION_DIPLOME)", async () => {
    await mockBCN(async (client) => {
      client
        .get("/nomenclature/N_NIVEAU_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_NIVEAU_FORMATION_DIPLOME"));

      client.get("/nomenclature/N_MEF?schema=consultation").reply(200, await Fixtures.BCN("N_MEF_EMPTY"));

      client
        .get("/nomenclature/V_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("V_FORMATION_DIPLOME_EMPTY"));

      client
        .get("/nomenclature/N_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_FORMATION_DIPLOME"));
    });

    let stats = await importBCN();

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      type: "cfd",
      code_certification: "14545678",
      code_formation_diplome: "14545678",
      libelle: "BAC PRO BATIMENT",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2022-07-31T00:00:00.000Z"),
      diplome: {
        code: "7",
        libelle: "MASTER",
      },
      niveauFormationDiplome: "463",
      groupeSpecialite: "212",
      lettreSpecialite: "S",
      ancien_diplome: [],
      nouveau_diplome: [],
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut gérer les codes formation avec diplome inconnu", async () => {
    await mockBCN(async (client) => {
      client
        .get("/nomenclature/N_NIVEAU_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_NIVEAU_FORMATION_DIPLOME"));

      client.get("/nomenclature/N_MEF?schema=consultation").reply(200, await Fixtures.BCN("N_MEF_EMPTY"));

      client
        .get("/nomenclature/V_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("V_FORMATION_DIPLOME_EMPTY"));

      client
        .get("/nomenclature/N_FORMATION_DIPLOME?schema=consultation")
        .reply(200, await Fixtures.BCN("N_FORMATION_DIPLOME_UNKNOW"));
    });

    let stats = await importBCN();

    let found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });
});
