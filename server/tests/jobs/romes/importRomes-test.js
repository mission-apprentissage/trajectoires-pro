import chai from "chai";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import { importRomes } from "#src/jobs/romes/importRomes.js";
import { mockDataGouv } from "#tests/utils/apiMocks.js";
import config from "#src/config.js";
import RomeRepository from "#src/common/repositories/rome.js";
import streamToArray from "stream-to-array";
import deepEqualInAnyOrder from "deep-equal-in-any-order";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("importRomes", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les ROMEs", async () => {
    mockDataGouv((client) => {
      client
        .get("/datasets/r/" + config.datagouv.datasets.rome)
        .query(() => true)
        .replyWithFile(200, "tests/fixtures/files/datagouv/RefRomeJson.zip");
    });
    let stats = await importRomes();

    const found = await streamToArray(await RomeRepository.find({}));
    assert.deepEqualInAnyOrder(
      found.map((f) => omit(f, "_id")),
      [
        {
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          code_ogr: 7,
          code_rome: "A1201",
          libelle: "Bûcheronnage et élagage",
        },
        {
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          code_ogr: 8,
          code_rome: "A1202",
          libelle: "Entretien des espaces naturels",
        },
        {
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          code_ogr: 6,
          code_rome: "A1101",
          libelle: "Conduite d'engins agricoles et forestiers",
        },
      ]
    );
    assert.deepStrictEqual(stats, {
      created: 3,
      failed: 0,
      updated: 0,
      total: 3,
    });
  });
});
