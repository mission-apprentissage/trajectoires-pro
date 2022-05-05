const assert = require("assert");
const InsertJeunesApi = require("../../src/common/api/InsertJeunesApi");
const { mockInsertJeunesApi } = require("../utils/apiMocks");
const { delay } = require("../../src/common/utils/asyncUtils");

describe("InsertJeunesApi", () => {
  function mockApi(uai, millesime) {
    mockInsertJeunesApi(
      (client, responses) => {
        client
          .post("/login")
          .query(() => true)
          .reply(
            200,
            responses.login({
              access_token: "token-1",
            })
          );

        client
          .post("/login")
          .query(() => true)
          .reply(
            200,
            responses.login({
              access_token: "token-2",
            })
          );

        client
          .get(`/UAI/${uai}/millesime/${millesime}`)
          .query(() => true)
          .reply(200, responses.uai());
        client

          .get(`/UAI/${uai}/millesime/${millesime}`)
          .query(() => true)
          .reply(200, responses.uai());
      },
      { stack: true }
    );
  }

  it("Vérifie qu'on ne se reloggue pas si le token n'est pas expiré", async () => {
    let api = new InsertJeunesApi();
    mockApi("0751234J", "2018_2019");

    await api.statsParEtablissement("0751234J", "2018_2019");
    await api.statsParEtablissement("0751234J", "2018_2019");

    assert.strictEqual(api.access_token, "token-1");
  });

  it("Vérifie qu'on peut configurer le timeout du token", async () => {
    mockApi("0751234J", "2018_2019");
    let api = new InsertJeunesApi({ access_token_timeout: 1 });

    await api.statsParEtablissement("0751234J", "2018_2019");
    await delay(25);
    await api.statsParEtablissement("0751234J", "2018_2019");

    assert.strictEqual(api.access_token, "token-2");
  });
});
