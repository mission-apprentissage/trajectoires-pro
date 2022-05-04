const assert = require("assert");
const config = require("../../src/config");
const { startServer } = require("../utils/testUtils");
const { mockInsertJeunesApi } = require("../utils/apiMocks");

describe("insertJeunesRoutes", () => {
  function mockApi(uai, millesime) {
    mockInsertJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/${uai}/millesime/${millesime}`)
        .query(() => true)
        .reply(200, responses.uai());
    });
  }

  function getAuthHeaders() {
    return {
      "x-api-key": config.insertJeunes.api.key,
    };
  }

  it("Vérifie qu'on peut obtenir les données pour un établissement et un millesime", async () => {
    const { httpClient } = await startServer();
    mockApi("0751234J", "2018_2019");

    const response = await httpClient.get(`/api/insertjeunes/uai/0751234J/millesime/2018_2019`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      uai: "0751234J",
      millesime: "2018_2019",
      formations: [
        {
          code_formation: "12345678",
          taux_emploi_6_mois: 6,
          taux_emploi_12_mois: 12,
        },
        {
          code_formation: "87456123",
          taux_emploi_12_mois: 10,
          taux_emploi_6_mois: 20,
        },
      ],
    });
  });

  it("Vérifie qu'on peut obtenir les données pour un établissement, un millesime et une formation", async () => {
    const { httpClient } = await startServer();
    mockApi("0751234J", "2018_2019");

    const response = await httpClient.get(
      "/api/insertjeunes/uai/0751234J/millesime/2018_2019?codes_formations=12345678",
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      uai: "0751234J",
      millesime: "2018_2019",
      formations: [
        {
          code_formation: "12345678",
          taux_emploi_6_mois: 6,
          taux_emploi_12_mois: 12,
        },
      ],
    });
  });

  it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
    const { httpClient } = await startServer();
    mockApi("0751234J", "2018_2019");

    const response = await httpClient.get(
      `/api/insertjeunes/uai/0751234J/millesime/2018_2019?apiKey=${config.insertJeunes.api.key}`
    );

    assert.strictEqual(response.status, 200);
  });
});
