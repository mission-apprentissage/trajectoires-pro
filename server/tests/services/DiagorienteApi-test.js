import assert from "assert";
import { DiagorienteApi } from "#src/services/diagoriente/DiagorienteApi.js";
import { mockDiagorienteApi } from "#tests/utils/apiMocks.js";

describe("DiagorienteApi", () => {
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

  describe("fetchRomes", () => {
    it("Retourne une liste de code ROMEs associés à des CFDs", async () => {
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
      const api = new DiagorienteApi();
      const result = await api.fetchRomes(["10000000"]);
      assert.deepEqual(result, [{ codeROME: "A1000" }]);
    });
  });

  describe("fetchMetiersAvenir", () => {
    it("Retourne une liste de métiers d'avenirs associés à un secteur ROME", async () => {
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
      const api = new DiagorienteApi();
      const result = await api.fetchMetiersAvenir(["A"]);
      assert.deepEqual(result, [
        {
          codeROME: "A1000",
          flagAValoriser: true,
          id: "1101",
          title: "Céréalier / Céréalière",
        },
      ]);
    });
  });
});
