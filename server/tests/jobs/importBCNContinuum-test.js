import assert from "assert";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import { bcn } from "../../src/common/db/collections/collections.js";
import { mockBCN } from "../utils/apiMocks.js";
import { importBCNContinuum } from "../../src/jobs/importBCNContinuum.js";
import { insertCFD } from "../utils/fakeData.js";

describe("importBCNContinuum", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les anciens/nouveaux diplomes", async () => {
    mockBCN((client) => {
      client.get("/CSV?n=N_FORMATION_DIPLOME&separator=%7C").reply(
        200,
        `FORMATION_DIPLOME|DATE_PREMIERE_SESSION|DATE_DERNIERE_SESSION|ANCIEN_DIPLOME_1|ANCIEN_DIPLOME_2|NOUVEAU_DIPLOME_1|NOUVEAU_DIPLOME_2
      14545678|2018|2023|old_1|old_2|new_1|new_2`
      );
    });

    await insertCFD({
      code_certification: "14545678",
      code_formation_diplome: "14545678",
    });

    let stats = await importBCNContinuum();

    const found = await bcn().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      type: "cfd",
      code_certification: "14545678",
      code_formation_diplome: "14545678",
      libelle: "BAC PRO BATIMENT",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      ancien_diplome: ["old_1", "old_2"],
      nouveau_diplome: ["new_1", "new_2"],
      date_premiere_session: "2018",
      date_derniere_session: "2023",
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, {
      total: 1,
      failed: 0,
      updated: 1,
    });
  });

  it("Vérifie qu'on ajoute les anciens/nouveaux diplomes manquants", async () => {
    mockBCN((client) => {
      client.get("/CSV?n=N_FORMATION_DIPLOME&separator=%7C").reply(
        200,
        `FORMATION_DIPLOME|DATE_PREMIERE_SESSION|DATE_DERNIERE_SESSION|ANCIEN_DIPLOME_1|ANCIEN_DIPLOME_2|NOUVEAU_DIPLOME_1|NOUVEAU_DIPLOME_2
      14545678|2018|2023|old_1|old_2|new_1|new_2
      old_1|2018|2023|old||new|
      new_1|2018|2023|old||new|`
      );
    });

    await Promise.all([
      insertCFD({ code_certification: "14545678", code_formation_diplome: "14545678" }),
      insertCFD({ code_certification: "old_1", code_formation_diplome: "old_1" }),
      insertCFD({ code_certification: "new_1", code_formation_diplome: "new_1" }),
    ]);

    let stats = await importBCNContinuum();

    const foundOld = await bcn().findOne({ code_certification: "old_1" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(foundOld, ["_meta"]), {
      type: "cfd",
      code_certification: "old_1",
      code_formation_diplome: "old_1",
      libelle: "BAC PRO BATIMENT",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      diplome: { code: "4", libelle: "BAC" },
      ancien_diplome: ["old"],
      nouveau_diplome: ["new", "14545678"],
      date_premiere_session: "2018",
      date_derniere_session: "2023",
    });
    assert.ok(foundOld._meta.date_import);

    const foundNew = await bcn().findOne({ code_certification: "new_1" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(foundNew, ["_meta"]), {
      type: "cfd",
      code_certification: "new_1",
      code_formation_diplome: "new_1",
      libelle: "BAC PRO BATIMENT",
      libelle_long: "BAC PRO BATIMENT",
      date_ouverture: new Date("2023-01-01T00:00:00.000Z"),
      diplome: { code: "4", libelle: "BAC" },
      ancien_diplome: ["old", "14545678"],
      nouveau_diplome: ["new"],
      date_premiere_session: "2018",
      date_derniere_session: "2023",
    });
    assert.ok(foundNew._meta.date_import);
    assert.deepStrictEqual(stats, {
      total: 3,
      failed: 0,
      updated: 3,
    });
  });
});
