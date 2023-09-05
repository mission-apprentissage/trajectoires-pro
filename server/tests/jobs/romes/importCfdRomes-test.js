import chai from "chai";
import MockDate from "mockdate";
import { importCfdRomes } from "#src/jobs/romes/importCfdRomes.js";
import { insertCFD } from "#tests/utils/fakeData.js";
import CfdRomesRepository from "#src/common/repositories/cfdRomes.js";
import streamToArray from "stream-to-array";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { mockDiagorienteApi } from "#tests/utils/apiMocks.js";
import { omit } from "lodash-es";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("importCfdRomes", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  function mockLogin(clientLogin, responses) {
    clientLogin
      .post("")
      .query(() => true)
      .reply(
        200,
        responses.login({
          access_token: "token-1",
        })
      );
  }

  it("Vérifie qu'on peut importer les métiers associés aux codes ROMEs", async () => {
    await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });

    mockDiagorienteApi(
      ({ client, clientLogin }, responses) => {
        mockLogin(clientLogin, responses);
        client
          .post("")
          .query(() => true)
          .reply(200, responses.romes());
      },
      { stack: true }
    );

    let stats = await importCfdRomes();
    const found = await streamToArray(await CfdRomesRepository.find({}));
    assert.deepEqualInAnyOrder(
      found.map((f) => omit(f, "_id")),
      [
        {
          code_formation_diplome: "12345678",
          code_romes: ["A1000"],
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        },
      ]
    );
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });
});
