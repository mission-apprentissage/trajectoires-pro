import chai from "chai";
import MockDate from "mockdate";
import { importRomeMetiers } from "#src/jobs/romes/importRomeMetiers.js";
import { insertRome } from "#tests/utils/fakeData.js";
import RomeMetierRepository from "#src/common/repositories/romeMetier.js";
import streamToArray from "stream-to-array";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { mockDiagorienteApi } from "#tests/utils/apiMocks.js";
import { omit } from "lodash-es";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("importRomeMetiers", () => {
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
    await insertRome({
      code_rome: "A1000",
      code_ogr: 30,
      libelle: "Polyculture, élevage",
    });

    mockDiagorienteApi(
      ({ client, clientLogin }, responses) => {
        mockLogin(clientLogin, responses);
        client
          .post("")
          .query(() => true)
          .reply(200, responses.metiersAvenir());
      },
      { stack: true }
    );

    let stats = await importRomeMetiers();
    const found = await streamToArray(await RomeMetierRepository.find({}));
    assert.deepEqualInAnyOrder(
      found.map((f) => omit(f, "_id")),
      [
        {
          code_rome: "A1000",
          title: "Céréalier / Céréalière",
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
          isMetierAvenir: true,
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
