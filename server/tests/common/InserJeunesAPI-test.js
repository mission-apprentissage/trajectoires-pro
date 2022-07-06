import assert from "assert";
import { InserJeunesApi } from "../../src/common/inserjeunes/InserJeunesApi.js";
import { mockInserJeunesApi } from "../utils/apiMocks.js";
import { delay } from "../../src/common/utils/asyncUtils.js";

describe("InserJeunesApi", () => {
  function mockApi(uai, millesime) {
    mockInserJeunesApi(
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
    let api = new InserJeunesApi();
    mockApi("0751234J", "2018_2019");

    await api.fetchEtablissementStats("0751234J", "2018_2019");
    await api.fetchEtablissementStats("0751234J", "2018_2019");

    assert.strictEqual(api.access_token, "token-1");
  });

  it("Vérifie qu'on peut configurer le timeout du token", async () => {
    mockApi("0751234J", "2018_2019");
    let api = new InserJeunesApi({ access_token_timeout: 1 });

    await api.fetchEtablissementStats("0751234J", "2018_2019");
    await delay(25);
    await api.fetchEtablissementStats("0751234J", "2018_2019");

    assert.strictEqual(api.access_token, "token-2");
  });
});
