import assert from "assert";
import { merge, omit } from "lodash-es";
import MockDate from "mockdate";
import { createStream } from "../utils/testUtils.js";
import { importBCN } from "../../src/jobs/importBCN.js";
import { bcn } from "../../src/common/db/collections/collections.js";
import { mockBCN } from "../utils/apiMocks.js";

function getBcnTables(custom = {}) {
  return merge(
    {},
    {
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE`),
      N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33`),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33`),
    },
    custom
  );
}

describe("importBCN", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les mefs", async () => {
    mockBCN((client) => {
      client.get("/CSV?n=N_NIVEAU_FORMATION_DIPLOME&separator=%7C").reply(
        200,
        `NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL|LIBELLE_COURT|LIBELLE_100|ANCIEN_NIVEAU|DATE_OUVERTURE|DATE_FERMETURE|DATE_INTERVENTION|N_COMMENTAIRE|NIVEAU_QUALIFICATION_RNCP
        400|4|BAC PRO|BAC PROFESSIONNEL|40|||10/12/2020||04`
      );
    });

    let stats = await importBCN(
      getBcnTables({
        N_MEF: createStream(`MEF|MEF_STAT_11|MEF_STAT_9|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE|DATE_OUVERTURE
999999991|99999999911|999999999|40023203|BAC PRO|31/08/2022|31/07/2022`),
      })
    );

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
    mockBCN((client) => {
      client
        .get("/CSV?n=N_NIVEAU_FORMATION_DIPLOME&separator=%7C")
        .reply(
          200,
          `NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL|LIBELLE_COURT|LIBELLE_100|ANCIEN_NIVEAU|DATE_OUVERTURE|DATE_FERMETURE|DATE_INTERVENTION|N_COMMENTAIRE|NIVEAU_QUALIFICATION_RNCP`
        );
    });

    let stats = await importBCN(
      getBcnTables({
        N_MEF: createStream(`MEF|MEF_STAT_11|MEF_STAT_9|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE|DATE_OUVERTURE
999999991|99999999911|999999999|INCONNU|BAC PRO|31/08/2022|31/07/2022`),
      })
    );

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
    mockBCN((client) => {
      client.get("/CSV?n=N_NIVEAU_FORMATION_DIPLOME&separator=%7C").reply(
        200,
        `NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL|LIBELLE_COURT|LIBELLE_100|ANCIEN_NIVEAU|DATE_OUVERTURE|DATE_FERMETURE|DATE_INTERVENTION|N_COMMENTAIRE|NIVEAU_QUALIFICATION_RNCP
        400|4|BAC PRO|BAC PROFESSIONNEL|40|||10/12/2020||04`
      );
    });

    let stats = await importBCN(
      getBcnTables({
        V_FORMATION_DIPLOME:
          createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33|LIBELLE_LONG_200|DATE_FERMETURE|DATE_OUVERTURE
40023203|403|BAC PRO|BATIMENT|BAC PRO BATIMENT|31/08/2022|31/07/2022`),
      })
    );

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
    mockBCN((client) => {
      client.get("/CSV?n=N_NIVEAU_FORMATION_DIPLOME&separator=%7C").reply(
        200,
        `NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL|LIBELLE_COURT|LIBELLE_100|ANCIEN_NIVEAU|DATE_OUVERTURE|DATE_FERMETURE|DATE_INTERVENTION|N_COMMENTAIRE|NIVEAU_QUALIFICATION_RNCP
        145|1|MASTER|MASTER (LMD) INDIFFERENCIE||01/09/2004||10/12/2020||07`
      );
    });

    let stats = await importBCN(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33|LIBELLE_LONG_200|DATE_OUVERTURE
14545678|||BAC PRO|BATIMENT|BAC PRO BATIMENT|31/07/2022`
        ),
      })
    );

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
      ancien_diplome: [],
      nouveau_diplome: [],
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut gérer les codes formation avec diplome inconnu", async () => {
    mockBCN((client) => {
      client
        .get("/CSV?n=N_NIVEAU_FORMATION_DIPLOME&separator=%7C")
        .reply(
          200,
          `NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL|LIBELLE_COURT|LIBELLE_100|ANCIEN_NIVEAU|DATE_OUVERTURE|DATE_FERMETURE|DATE_INTERVENTION|N_COMMENTAIRE|NIVEAU_QUALIFICATION_RNCP`
        );
    });

    let stats = await importBCN(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_LONG_200|DATE_OUVERTURE
        99999902|999|TEST|31/07/2022`),
      })
    );

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
