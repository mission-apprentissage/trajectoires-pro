import assert from "assert";
import { merge, omit } from "lodash-es";
import { importCodeFormationDiplomes } from "../../src/jobs/importCodeFormationDiplomes.js";
import { createStream } from "../utils/testUtils.js";
import { codeFormationDiplomes } from "../../src/common/collections/collections.js";

function getBcnTables(custom = {}) {
  return merge(
    {},
    {
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|MEF_STAT_9|MEF_STAT_11`),
      N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33`),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33`),
    },
    custom
  );
}

describe("importCodeFormationDiplomes", () => {
  it("Vérifie qu'on peut importer les codes formation (apprentissage)", async () => {
    let stats = await importCodeFormationDiplomes(
      getBcnTables({
        V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33
40023203|403|BAC PRO|BATIMENT`),
      })
    );

    const found = await codeFormationDiplomes().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "40023203",
      libelle: "BAC PRO BATIMENT",
      code_formation_alternatifs: [],
      mef: [],
      mef_stats_9: [],
      mef_stats_11: [],
      diplome: {
        code: "4",
        libelle: "BAC",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer les codes formation (secondaire)", async () => {
    let stats = await importCodeFormationDiplomes(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33
12345678|||BAC PRO|BATIMENT`
        ),
      })
    );

    const found = await codeFormationDiplomes().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "12345678",
      code_formation_alternatifs: [],
      mef: [],
      mef_stats_9: [],
      mef_stats_11: [],
      libelle: "BAC PRO BATIMENT",
      diplome: {
        code: "7",
        libelle: "MASTER",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer un code formation et ses MEF", async () => {
    await importCodeFormationDiplomes(
      getBcnTables({
        N_MEF: createStream(`FORMATION_DIPLOME|MEF|MEF_STAT_9|MEF_STAT_11
12345678|99976543210|999765432|99976543210
12345678|88876543210|888765432|88876543210`),
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33
12345678|32031211|51033003|BAC PRO|BATIMENT`
        ),
      })
    );

    const found = await codeFormationDiplomes().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.mef, ["99976543210", "88876543210"]);
    assert.deepStrictEqual(found.mef_stats_11, ["99976543210", "88876543210"]);
    assert.deepStrictEqual(found.mef_stats_9, ["999765432", "888765432"]);
  });

  it("Vérifie qu'on peut importer un code formation avec des codes alternatifs", async () => {
    await importCodeFormationDiplomes(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33
12345678|32031211|51033003|BAC PRO|BATIMENT`
        ),
      })
    );

    const found = await codeFormationDiplomes().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.code_formation_alternatifs, ["32031211", "51033003"]);
  });

  it("Vérifie qu'on peut gérer les codes formation avec diplome inconnu", async () => {
    let stats = await importCodeFormationDiplomes(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n99999902|999`),
      })
    );

    let found = await codeFormationDiplomes().findOne({ code_formation: "99999902" }, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });
});
