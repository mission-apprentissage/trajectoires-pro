import assert from "assert";
import { omit } from "lodash-es";
import { importCertifications } from "../../src/jobs/importCertifications.js";
import { createStream } from "../utils/testUtils.js";
import { certifications } from "../../src/common/collections/index.js";

describe("importCertifications", () => {
  it("Vérifie qu'on peut importer les codes formation", async () => {
    let stats = await importCertifications({
      N_NIVEAU_FORMATION_DIPLOME: createStream(`NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL\n403|4`),
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|MEF_STAT_9|MEF_STAT_11\n9999990299|99999902|99990099902|251100310`),
      N_FORMATION_DIPLOME: createStream(
        `FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1\n99999902|403|32031211|51033003`
      ),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n40023203|403`),
    });

    let found = await certifications().findOne({ code_formation: "99999902" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "99999902",
      alias: [
        {
          code: "251100310",
          type: "mef_stat_11",
        },
        {
          code: "32031211",
          type: "code_formation_ancien",
        },
        {
          code: "51033003",
          type: "code_formation_nouveau",
        },
        {
          code: "99990099902",
          type: "mef_stat_9",
        },
        {
          code: "9999990299",
          type: "mef",
        },
      ],
      diplome: {
        code: "4",
        label: "BAC",
      },
    });

    found = await certifications().findOne({ code_formation: "40023203" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "40023203",
      alias: [],
      diplome: {
        code: "4",
        label: "BAC",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0, total: 2 });
  });

  it("Vérifie qu'on peut importer des codes formation en apprentissage et pro", async () => {
    let stats = await importCertifications({
      N_NIVEAU_FORMATION_DIPLOME: createStream(`NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL\n403|4`),
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|MEF_STAT_9|MEF_STAT_11\n9999990299|99999902|99990099902|251100310`),
      N_FORMATION_DIPLOME: createStream(
        `FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME|ANCIEN_DIPLOME_1|NOUVEAU_DIPLOME_1\n99999902|403|32031211|51033003`
      ),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n40023203|403`),
    });

    let found = await certifications().findOne({ code_formation: "99999902" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "99999902",
      alias: [
        {
          code: "251100310",
          type: "mef_stat_11",
        },
        {
          code: "32031211",
          type: "code_formation_ancien",
        },
        {
          code: "51033003",
          type: "code_formation_nouveau",
        },
        {
          code: "99990099902",
          type: "mef_stat_9",
        },
        {
          code: "9999990299",
          type: "mef",
        },
      ],
      diplome: {
        code: "4",
        label: "BAC",
      },
    });

    found = await certifications().findOne({ code_formation: "40023203" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      code_formation: "40023203",
      alias: [],
      diplome: {
        code: "4",
        label: "BAC",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0, total: 2 });
  });

  it("Vérifie qu'on peut gérer les codes formations du secondaire avec niveau inconnu", async () => {
    let stats = await importCertifications({
      N_NIVEAU_FORMATION_DIPLOME: createStream(`NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL\n403|4`),
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|MEF_STAT_9|MEF_STAT_11\n9999990299|99999902|99990099902|251100310`),
      N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n99999902|INCONNU`),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n`),
    });

    let found = await certifications().findOne({ code_formation: "99999902" }, { projection: { _id: 0 } });
    assert.ok(!found.diplome);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });

  it("Vérifie qu'on peut gérer les codes formations du secondaire sans code mef", async () => {
    let stats = await importCertifications({
      N_NIVEAU_FORMATION_DIPLOME: createStream(`NIVEAU_FORMATION_DIPLOME|NIVEAU_INTERMINISTERIEL\n403|4`),
      N_MEF: createStream(`MEF|FORMATION_DIPLOME|MEF_STAT_9|MEF_STAT_11\n9999990299|XXXXXXXXX|99990099902|251100310`),
      N_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n99999902|403`),
      V_FORMATION_DIPLOME: createStream(`FORMATION_DIPLOME|NIVEAU_FORMATION_DIPLOME\n`),
    });

    let found = await certifications().findOne({ code_formation: "99999902" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.alias, []);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0, total: 1 });
  });
});
