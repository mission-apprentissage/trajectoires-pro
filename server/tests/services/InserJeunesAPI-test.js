import assert from "assert";
import { InserJeunesApi } from "#src/services/inserjeunes/InserJeunesApi.js";
import { mockInserJeunesApi } from "#tests/utils/apiMocks.js";
import { delay } from "#src/common/utils/asyncUtils.js";

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

  it("Réessai une requête lorsque l'API renvoi une erreur", async () => {
    mockInserJeunesApi(
      (client, responses) => {
        client
          .post("/login")
          .query(() => true)
          .replyWithError("Error");

        client
          .post("/login")
          .query(() => true)
          .reply(
            200,
            responses.login({
              access_token: "token",
            })
          );
      },
      { stack: true }
    );

    let api = new InserJeunesApi({ retry: { retries: 1, factor: 1, minTimeout: 0 } });
    await api.login();

    assert.strictEqual(api.access_token, "token");
  });
});
