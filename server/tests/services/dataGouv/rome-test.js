import assert from "assert";
import { streamRomes } from "#src/services/dataGouv/rome.js";
import { mockDataGouv } from "#tests/utils/apiMocks.js";
import streamToArray from "stream-to-array";
import config from "#src/config.js";

describe("streamRomes", () => {
  it("Retourne un stream de codes ROME", async () => {
    mockDataGouv((client) => {
      client
        .get("/datasets/r/" + config.datagouv.datasets.rome)
        .query(() => true)
        .replyWithFile(200, "tests/fixtures/files/datagouv/RefRomeJson.zip");
    });

    const stream = await streamRomes();
    const result = await streamToArray(stream);
    assert.deepEqual(result, [
      {
        code_ogr: 6,
        code_rome: "A1101",
        dev_durable: "",
        libelle: "Conduite d'engins agricoles et forestiers",
        transition_num: "",
      },
      {
        code_ogr: 7,
        code_rome: "A1201",
        dev_durable: "",
        libelle: "Bûcheronnage et élagage",
        transition_num: "",
      },
      {
        code_ogr: 8,
        code_rome: "A1202",
        dev_durable: "",
        libelle: "Entretien des espaces naturels",
        transition_num: "",
      },
    ]);
  });
});
