import assert from "assert";
import { omit, pick } from "lodash-es";
import MockDate from "mockdate";
import { computeBCNMEFContinuum } from "#src/jobs/bcn/computeBCNMEFContinuum.js";
import { bcn } from "#src/common/db/collections/collections.js";
import { insertCFD, insertBCNMEF, insertMEF } from "#tests/utils/fakeData.js";

describe("computeBCNMEFContinuum", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les anciens/nouveaux diplomes", async () => {
    await Promise.all([
      insertCFD({
        code_certification: "10000001",
        code_formation_diplome: "10000001",
        nouveau_diplome: ["10000002"],
        ancien_diplome: ["10000000"],
        date_premiere_session: "2018",
        date_derniere_session: "2023",
      }),
      insertCFD({
        code_certification: "10000002",
        code_formation_diplome: "10000002",
        ancien_diplome: ["10000001"],
        date_premiere_session: "2018",
        date_derniere_session: "2023",
      }),
      insertCFD({
        code_certification: "10000000",
        code_formation_diplome: "10000000",
        nouveau_diplome: ["10000001"],
        date_premiere_session: "2018",
        date_derniere_session: "2023",
      }),
      insertMEF({
        code_certification: "10000000001",
        code_formation_diplome: "10000001",
      }),
      insertMEF({
        code_certification: "10000000002",
        code_formation_diplome: "10000002",
      }),
      insertMEF({
        code_certification: "10000000000",
        code_formation_diplome: "10000000",
      }),
      insertBCNMEF({
        mef_stat_11: "10000000001",
        formation_diplome: "10000001",
        dispositif_formation: "123",
      }),
      insertBCNMEF({
        mef_stat_11: "10000000000",
        formation_diplome: "10000000",
        dispositif_formation: "123",
      }),
      insertBCNMEF({
        mef_stat_11: "10000000002",
        formation_diplome: "10000002",
        dispositif_formation: "123",
      }),
    ]);

    let stats = await computeBCNMEFContinuum();

    const foundOld = await bcn().findOne({ code_certification: "10000000000" });
    assert.deepStrictEqual(omit(foundOld, ["_id"]), {
      type: "mef",
      code_certification: "10000000000",
      code_formation_diplome: "10000000",
      libelle: "BAC PRO",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      ancien_diplome: [],
      nouveau_diplome: ["10000000001"],
      date_premiere_session: "2018",
      date_derniere_session: "2023",
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
    });

    const found = await bcn().findOne({ code_certification: "10000000001" });
    assert.deepStrictEqual(omit(found, ["_id"]), {
      type: "mef",
      code_certification: "10000000001",
      code_formation_diplome: "10000001",
      libelle: "BAC PRO",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      ancien_diplome: ["10000000000"],
      nouveau_diplome: ["10000000002"],
      date_premiere_session: "2018",
      date_derniere_session: "2023",
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
    });

    const foundNew = await bcn().findOne({ code_certification: "10000000002" });
    assert.deepStrictEqual(omit(foundNew, ["_id"]), {
      type: "mef",
      code_certification: "10000000002",
      code_formation_diplome: "10000002",
      libelle: "BAC PRO",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      ancien_diplome: ["10000000001"],
      nouveau_diplome: [],
      date_premiere_session: "2018",
      date_derniere_session: "2023",
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
    });
    assert.deepStrictEqual(stats, {
      total: 3,
      failed: 0,
      updated: 3,
    });
  });

  it("Vérifie qu'on importe uniquement les diplomes des même dispositifs et avec les 4 premiers characteres mef11 identiques", async () => {
    await Promise.all([
      insertCFD({
        code_certification: "10000001",
        code_formation_diplome: "10000001",
        nouveau_diplome: [],
        ancien_diplome: ["10000000"],
      }),
      insertCFD({
        code_certification: "10000000",
        code_formation_diplome: "10000000",
        nouveau_diplome: ["10000001"],
      }),
      insertMEF({
        code_certification: "10000000001",
        code_formation_diplome: "10000001",
      }),
      insertMEF({
        code_certification: "10000000000",
        code_formation_diplome: "10000000",
      }),
      insertMEF({
        code_certification: "10000000005",
        code_formation_diplome: "10000000",
      }),
      insertMEF({
        code_certification: "20000000000",
        code_formation_diplome: "10000000",
      }),
      insertBCNMEF({
        mef_stat_11: "10000000001",
        formation_diplome: "10000001",
        dispositif_formation: "123",
      }),
      insertBCNMEF({
        mef_stat_11: "10000000000",
        formation_diplome: "10000000",
        dispositif_formation: "123",
      }),
      insertBCNMEF({
        mef_stat_11: "10000000005",
        formation_diplome: "10000000",
        dispositif_formation: "100",
      }),
      insertBCNMEF({
        mef_stat_11: "20000000000",
        formation_diplome: "10000000",
        dispositif_formation: "123",
      }),
    ]);

    let stats = await computeBCNMEFContinuum();

    const foundOld = await bcn().findOne({ code_certification: "10000000000" });
    assert.deepStrictEqual(omit(foundOld, ["_id"]), {
      type: "mef",
      code_certification: "10000000000",
      code_formation_diplome: "10000000",
      libelle: "BAC PRO",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      ancien_diplome: [],
      nouveau_diplome: ["10000000001"],
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
    });

    const found = await bcn().findOne({ code_certification: "10000000001" });
    assert.deepStrictEqual(omit(found, ["_id"]), {
      type: "mef",
      code_certification: "10000000001",
      code_formation_diplome: "10000001",
      libelle: "BAC PRO",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      ancien_diplome: ["10000000000"],
      nouveau_diplome: [],
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
    });

    const foundOther = await bcn().findOne({ code_certification: "10000000005" });
    assert.deepEqual(pick(foundOther, ["ancien_diplome", "nouveau_diplome"]), {
      nouveau_diplome: [],
      ancien_diplome: [],
    });

    const foundOther2 = await bcn().findOne({ code_certification: "20000000000" });
    assert.deepEqual(pick(foundOther2, ["ancien_diplome", "nouveau_diplome"]), {
      nouveau_diplome: [],
      ancien_diplome: [],
    });

    assert.deepStrictEqual(stats, {
      total: 4,
      failed: 0,
      updated: 1,
    });
  });
});
