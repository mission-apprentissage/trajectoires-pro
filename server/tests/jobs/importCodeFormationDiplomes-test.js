import assert from "assert";
import { merge, omit } from "lodash-es";
import { importCfds } from "../../src/jobs/importCfds.js";
import { createStream } from "../utils/testUtils.js";
import { cfds } from "../../src/common/db/collections.js";

function getBcnTables(custom = {}) {
  return merge(
    {},
    {
      N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33`),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33`),
    },
    custom
  );
}

describe("importCodeFormationDiplomes", () => {
  it("Vérifie qu'on peut importer les codes formation (apprentissage)", async () => {
    let stats = await importCfds(
      getBcnTables({
        V_FORMATION_DIPLOME:
          createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|LIBELLE_COURT|LIBELLE_STAT_33|DATE_FERMETURE
40023203|403|BAC PRO|BATIMENT|31/08/2022`),
      })
    );

    const found = await cfds().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "40023203",
      libelle: "BAC PRO BATIMENT",
      code_formation_alternatifs: [],
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer les codes formation (secondaire)", async () => {
    let stats = await importCfds(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33
12345678|||BAC PRO|BATIMENT`
        ),
      })
    );

    const found = await cfds().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "12345678",
      code_formation_alternatifs: [],
      libelle: "BAC PRO BATIMENT",
      diplome: {
        code: "7",
        libelle: "MASTER",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut importer un code formation avec des codes alternatifs", async () => {
    await importCfds(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(
          `FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1|LIBELLE_COURT|LIBELLE_STAT_33
12345678|32031211|51033003|BAC PRO|BATIMENT`
        ),
      })
    );

    const found = await cfds().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.code_formation_alternatifs, ["32031211", "51033003"]);
  });

  it("Vérifie qu'on peut gérer les codes formation avec diplome inconnu", async () => {
    let stats = await importCfds(
      getBcnTables({
        N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n99999902|999`),
      })
    );

    let found = await cfds().findOne({ code_formation: "99999902" }, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });
});
