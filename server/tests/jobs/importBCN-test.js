import assert from "assert";
import { merge, omit } from "lodash-es";
import { createStream } from "../utils/testUtils.js";
import { importBCN } from "../../src/jobs/importBCN.js";
import { bcn } from "../../src/common/db/collections/collections.js";

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
  it("Vérifie qu'on peut importer les mefs", async () => {
    let stats = await importBCN(
      getBcnTables({
        N_MEF: createStream(`MEF|MEF_STAT_11|MEF_STAT_9|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE
999999991|99999999911|999999999|40023203|BAC PRO|31/08/2022`),
      })
    );

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      type: "mef",
      code_certification: "99999999911",
      code_formation_diplome: "40023203",
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      diplome: { code: "4", libelle: "BAC" },
      libelle: "BAC PRO",
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer un mef avec diplome inconnu", async () => {
    let stats = await importBCN(
      getBcnTables({
        N_MEF: createStream(`MEF|MEF_STAT_11|MEF_STAT_9|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE
999999991|99999999911|999999999|INCONNU|BAC PRO|31/08/2022`),
      })
    );

    let found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer les CFD (V_FORMATION_DIPLOME)", async () => {
    let stats = await importBCN(
      getBcnTables({
        V_FORMATION_DIPLOME:
          createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33|DATE_FERMETURE
40023203|403|BAC PRO|BATIMENT|31/08/2022`),
      })
    );

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      type: "cfd",
      code_certification: "40023203",
      code_formation_diplome: "40023203",
      libelle: "BAC PRO BATIMENT",
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer les CFD (N_FORMATION_DIPLOME)", async () => {
    let stats = await importBCN(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33
12345678|||BAC PRO|BATIMENT`
        ),
      })
    );

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      type: "cfd",
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      libelle: "BAC PRO BATIMENT",
      diplome: {
        code: "7",
        libelle: "MASTER",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut gérer les codes formation avec diplome inconnu", async () => {
    let stats = await importBCN(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n99999902|999`),
      })
    );

    let found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });
});
