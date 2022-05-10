const assert = require("assert");
const config = require("../../src/config");
const { startServer } = require("../utils/testUtils");
const { mockInserJeunesApi } = require("../utils/apiMocks");
const { insertFormationsStats } = require("../utils/fakeData");

describe("inserJeunesRoutes", () => {
  function mockApi(uai, millesime) {
    mockInserJeunesApi((client, responses) => {
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
      "x-api-key": config.inserJeunes.api.key,
    };
  }

  it("Vérifie qu'on peut obtenir les stats d'une formation", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats();

    const response = await httpClient.get(`/api/inserjeunes/formations`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      formations: [
        {
          uai: "0751234J",
          code_formation: "12345678",
          millesime: "2018_2019",
          type: "apprentissage",
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
      pagination: {
        nombre_de_page: 1,
        page: 1,
        items_par_page: 10,
        total: 1,
      },
    });
  });

  it("Vérifie qu'on peut limiter le nombre de résultats", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({ uai: "0751234J" });
    await insertFormationsStats({ uai: "0751234X" });

    const response = await httpClient.get(`/api/inserjeunes/formations?items_par_page=1`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.formations.length, 1);
  });

  it("Vérifie qu'on peut paginer les résultats", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({ uai: "0751234J" });
    await insertFormationsStats({ uai: "0751234X" });

    const response = await httpClient.get(`/api/inserjeunes/formations?items_par_page=1&page=2`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.formations.length, 1);
    assert.strictEqual(response.data.formations[0].uai, "0751234X");
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour un établissement", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({ uai: "0751234J" });
    await insertFormationsStats({ uai: "0751234X" });

    const response = await httpClient.get(`/api/inserjeunes/formations?uais=0751234J`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      formations: [
        {
          uai: "0751234J",
          code_formation: "12345678",
          millesime: "2018_2019",
          type: "apprentissage",
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
      pagination: {
        nombre_de_page: 1,
        page: 1,
        items_par_page: 10,
        total: 1,
      },
    });
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour un millesime", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({ uai: "0751234J", millesime: "2018_2019" });
    await insertFormationsStats({ uai: "0751234X", millesime: "2020_2021" });

    const response = await httpClient.get(`/api/inserjeunes/formations?millesimes=2018_2019`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      formations: [
        {
          uai: "0751234J",
          code_formation: "12345678",
          millesime: "2018_2019",
          type: "apprentissage",
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
      pagination: {
        nombre_de_page: 1,
        page: 1,
        items_par_page: 10,
        total: 1,
      },
    });
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour code formation", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats({ uai: "0751234J", code_formation: "12345" });
    await insertFormationsStats({ uai: "0751234J", code_formation: "67890" });

    const response = await httpClient.get(`/api/inserjeunes/formations?codes_formation=12345`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      formations: [
        {
          uai: "0751234J",
          code_formation: "12345",
          millesime: "2018_2019",
          type: "apprentissage",
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
      pagination: {
        nombre_de_page: 1,
        page: 1,
        items_par_page: 10,
        total: 1,
      },
    });
  });

  it("Vérifie qu'on peut exporter les données au format CSV", async () => {
    const { httpClient } = await startServer();
    await insertFormationsStats();

    const response = await httpClient.get(`/api/inserjeunes/formations.csv`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
    assert.deepStrictEqual(
      response.data,
      `uai;code_formation;type;millesime;nb_annee_term;nb_en_emploi_12_mois;nb_en_emploi_6_mois;nb_poursuite_etudes;nb_sortant;taux_emploi_12_mois;taux_emploi_6_mois;taux_poursuite_etudes
0751234J;12345678;apprentissage;2018_2019;46;12;10;14;32;38;31;30
`
    );
  });

  it("Vérifie qu'on retourne une 404 si les paramètres sont invalides", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get(`/api/inserjeunes/formations?invalid=true`, {
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

    const response = await httpClient.get(`/api/inserjeunes/formations`);

    assert.strictEqual(response.status, 401);
  });

  it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
    const { httpClient } = await startServer();
    mockApi("0751234J", "2018_2019");

    const response = await httpClient.get(`/api/inserjeunes/formations?apiKey=${config.inserJeunes.api.key}`);

    assert.strictEqual(response.status, 200);
  });
});
