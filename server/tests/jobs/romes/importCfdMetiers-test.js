import chai from "chai";
import MockDate from "mockdate";
import { importCfdMetiers } from "#src/jobs/romes/importCfdMetiers.js";
import { insertRomeMetier, insertCfdRomes } from "#tests/utils/fakeData.js";
import CfdMetiersRepository from "#src/common/repositories/cfdMetiers.js";
import streamToArray from "stream-to-array";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { omit } from "lodash-es";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("importCfdMetiers", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les métiers associés à un CFD", async () => {
    await insertCfdRomes({ code_romes: ["A1000"], code_formation_diplome: "10000000" });
    await insertCfdRomes({ code_romes: ["B2000"], code_formation_diplome: "20000000" });
    await insertRomeMetier({ code_rome: "A1000" });
    await insertRomeMetier({ code_rome: "B2000" });

    let stats = await importCfdMetiers();
    const found = await streamToArray(await CfdMetiersRepository.find({}));
    assert.deepEqualInAnyOrder(
      found.map((f) => omit(f, "_id")),
      [
        {
          code_formation_diplome: "10000000",
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          code_romes: ["A1000"],
          metiers: [{ code_rome: "A1000", title: "Céréalier / Céréalière", isMetierAvenir: true }],
        },
        {
          code_formation_diplome: "20000000",
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          code_romes: ["B2000"],
          metiers: [{ code_rome: "B2000", title: "Céréalier / Céréalière", isMetierAvenir: true }],
        },
      ]
    );

    assert.deepStrictEqual(stats, {
      created: 2,
      failed: 0,
      updated: 0,
      total: 2,
    });
  });
});
