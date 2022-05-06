const assert = require("assert");
const config = require("../../src/config");
const { startServer } = require("../utils/testUtils");
const { mockInsertJeunesApi } = require("../utils/apiMocks");
const { insertEtablissementsStats } = require("../utils/fakeData");
const { uniq } = require("lodash");

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

  it("Vérifie qu'on peut obtenir les stats de formations pour les établissements", async () => {
    const { httpClient } = await startServer();
    await insertEtablissementsStats();

    const response = await httpClient.get(`/api/insertjeunes/etablissements`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, [
      {
        uai: "0751234J",
        formations: [
          {
            code_formation: "12345678",
            millesime: "2018_2019",
            nb_annee_term: 46,
            nb_en_emploi_12_mois: 12,
            nb_en_emploi_6_mois: 10,
            nb_poursuite_etudes: 14,
            nb_sortant: 32,
            taux_emploi_12_mois: 38,
            taux_emploi_6_mois: 31,
            taux_poursuite_etudes: 30,
          },
          {
            code_formation: "87456123",
            millesime: "2018_2019",
            nb_annee_term: 46,
            nb_en_emploi_12_mois: 12,
            nb_en_emploi_6_mois: 10,
            nb_poursuite_etudes: 14,
            nb_sortant: 32,
            taux_emploi_12_mois: 38,
            taux_emploi_6_mois: 31,
            taux_poursuite_etudes: 30,
          },
        ],
      },
    ]);
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour un établissement", async () => {
    const { httpClient } = await startServer();
    await insertEtablissementsStats({ uai: "0751234J" });
    await insertEtablissementsStats({ uai: "0751234X" });

    const response = await httpClient.get(`/api/insertjeunes/etablissements?uais=0751234J`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.length, 1);
    assert.strictEqual(response.data[0].uai, "0751234J");
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour un millesime", async () => {
    const { httpClient } = await startServer();
    await insertEtablissementsStats({
      uai: "0751234J",
      formations: [
        {
          millesime: "2018_2019",
        },
        {
          millesime: "2020_2021",
        },
      ],
    });
    await insertEtablissementsStats({
      uai: "0751234X",
      formations: [
        {
          millesime: "2018_2019",
        },
      ],
    });

    const response = await httpClient.get(`/api/insertjeunes/etablissements?millesimes=2018_2019`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(uniq(response.data[0].formations.map((f) => f.millesime)), ["2018_2019"]);
    assert.deepStrictEqual(uniq(response.data[1].formations.map((f) => f.millesime)), ["2018_2019"]);
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour code formation", async () => {
    const { httpClient } = await startServer();
    await insertEtablissementsStats({
      uai: "0751234J",
      formations: [
        {
          code_formation: "12345",
        },
        {
          code_formation: "67890",
        },
      ],
    });

    const response = await httpClient.get(`/api/insertjeunes/etablissements?codes_formation=12345`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, [
      {
        uai: "0751234J",
        formations: [
          {
            code_formation: "12345",
            millesime: "2018_2019",
            nb_annee_term: 46,
            nb_en_emploi_12_mois: 12,
            nb_en_emploi_6_mois: 10,
            nb_poursuite_etudes: 14,
            nb_sortant: 32,
            taux_emploi_12_mois: 38,
            taux_emploi_6_mois: 31,
            taux_poursuite_etudes: 30,
          },
        ],
      },
    ]);
  });

  it("Vérifie qu'on retourne une 404 si les paramètres sont invalides", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get(`/api/insertjeunes/etablissements?invalid=true`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 400);
    assert.deepStrictEqual(response.data, {
      details: [
        {
          context: {
            child: "invalid",
            key: "invalid",
            label: "invalid",
            value: "true",
          },
          message: '"invalid" is not allowed',
          path: ["invalid"],
          type: "object.unknown",
        },
      ],
      error: "Bad Request",
      message: "Erreur de validation",
      statusCode: 400,
    });
  });

  it("Vérifie qu'on retourne une 401 sans apiKey", async () => {
    const { httpClient } = await startServer();
    mockApi("0751234J", "2018_2019");

    const response = await httpClient.get(`/api/insertjeunes/etablissements`);

    assert.strictEqual(response.status, 401);
  });

  it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
    const { httpClient } = await startServer();
    mockApi("0751234J", "2018_2019");

    const response = await httpClient.get(`/api/insertjeunes/etablissements?apiKey=${config.insertJeunes.api.key}`);

    assert.strictEqual(response.status, 200);
  });
});
