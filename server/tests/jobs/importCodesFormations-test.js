import assert from "assert";
import { omit } from "lodash-es";
import { importCodesFormations } from "../../src/jobs/importCodesFormations.js";
import { createStream } from "../utils/testUtils.js";
import { codesFormations } from "../../src/common/collections/index.js";

describe("importCodesFormations", () => {
  it("Vérifie qu'on peut importer les codes formation (mefstats11)", async () => {
    let stats = await importCodesFormations({
      N_NIVEAU_FORMATION_DIPLOME: createStream(`NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL\n403|4`),
      N_DISPOSITIF_FORMATION: createStream(`DISPOSITIF_FORMATION|NIVEAU_FORMATION_DIPLOME\n276|403`),
      N_MEF: createStream(`DISPOSITIF_FORMATION|MEF_STAT_11\n276|23811021113`),
    });

    let found = await codesFormations().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "23811021113",
      niveau: {
        code: "4",
        diplome: "BAC",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, missing: 0, total: 1 });
  });

  it("Vérifie qu'on peut détecter les codes formations avec niveau inconnu (mefstats11)", async () => {
    let stats = await importCodesFormations({
      N_NIVEAU_FORMATION_DIPLOME: createStream(`NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL\n403|4`),
      N_DISPOSITIF_FORMATION: createStream(`DISPOSITIF_FORMATION|NIVEAU_FORMATION_DIPLOME\n276|403`),
      N_MEF: createStream(`DISPOSITIF_FORMATION|MEF_STAT_11\nXXXXXX|23811021113`),
    });

    let found = await codesFormations().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "23811021113",
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, missing: 1, total: 1 });
  });
});
