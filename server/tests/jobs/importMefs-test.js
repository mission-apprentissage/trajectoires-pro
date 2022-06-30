import assert from "assert";
import { merge, omit } from "lodash-es";
import { createStream } from "../utils/testUtils.js";
import { mefs } from "../../src/common/db/collections/collections.js";
import { importMefs } from "../../src/jobs/importMefs.js";

function getBcnTables(custom = {}) {
  return merge(
    {},
    {
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE`),
    },
    custom
  );
}

describe("importMefs", () => {
  it("Vérifie qu'on peut importer les mefs", async () => {
    let stats = await importMefs(
      getBcnTables({
        N_MEF: createStream(`MEF|MEF_STAT_11|MEF_STAT_9|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE
999999991|99999999911|999999999|40023203|BAC PRO|31/08/2022`),
      })
    );

    const found = await mefs().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      mef: "999999991",
      mef_stat_9: "999999999",
      mef_stat_11: "99999999911",
      code_formation_diplome: "40023203",
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      diplome: { code: "4", libelle: "BAC" },
      libelle: "BAC PRO",
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer un mef avec diplome inconnu", async () => {
    let stats = await importMefs(
      getBcnTables({
        N_MEF: createStream(`MEF|MEF_STAT_11|MEF_STAT_9|FORMATION_DIPLOME|LIBELLE_LONG|DATE_FERMETURE
999999991|99999999911|999999999|INCONNU|BAC PRO|31/08/2022`),
      })
    );

    let found = await mefs().findOne({}, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });
});
