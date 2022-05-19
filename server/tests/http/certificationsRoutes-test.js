const assert = require("assert");
const config = require("../../src/config");
const { startServer } = require("../utils/testUtils");
const { insertCertificationsStats } = require("../utils/fakeData");

describe("certificationsRoutes", () => {
  function getAuthHeaders() {
    return {
      "x-api-key": config.inserJeunes.api.key,
    };
  }

  it("Vérifie qu'on peut obtenir les stats d'une certification", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({
      millesime: "2020",
      code_formation: "12345678",
      filiere: "apprentissage",
      nb_annee_term: 1,
      nb_poursuite_etudes: 2,
      nb_en_emploi_12_mois: 3,
      nb_en_emploi_6_mois: 4,
      taux_poursuite_etudes: 5,
      taux_emploi_12_mois: 6,
      taux_emploi_6_mois: 7,
      taux_rupture_contrats: 8,
    });

    const response = await httpClient.get(`/api/inserjeunes/certifications`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, {
      certifications: [
        {
          millesime: "2020",
          code_formation: "12345678",
          filiere: "apprentissage",
          nb_annee_term: 1,
          nb_poursuite_etudes: 2,
          nb_en_emploi_12_mois: 3,
          nb_en_emploi_6_mois: 4,
          taux_poursuite_etudes: 5,
          taux_emploi_12_mois: 6,
          taux_emploi_6_mois: 7,
          taux_rupture_contrats: 8,
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
    await insertCertificationsStats();
    await insertCertificationsStats();

    const response = await httpClient.get(`/api/inserjeunes/certifications?items_par_page=1`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.certifications.length, 1);
  });

  it("Vérifie qu'on peut paginer les résultats", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({ filiere: "apprentissage" });
    await insertCertificationsStats({ filiere: "pro" });

    const response = await httpClient.get(`/api/inserjeunes/certifications?items_par_page=1&page=2`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.certifications.length, 1);
    assert.strictEqual(response.data.certifications[0].filiere, "pro");
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour un millesime", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({ millesime: "2018" });
    await insertCertificationsStats({ millesime: "2020" });

    const response = await httpClient.get(`/api/inserjeunes/certifications?millesimes=2018`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.certifications[0].millesime, "2018");
    assert.strictEqual(response.data.pagination.total, 1);
  });

  it("Vérifie qu'on peut obtenir les stats de formations pour code formation", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({ code_formation: "12345" });
    await insertCertificationsStats({ code_formation: "67890" });

    const response = await httpClient.get(`/api/inserjeunes/certifications?codes_formation=12345`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.certifications[0].code_formation, "12345");
    assert.strictEqual(response.data.pagination.total, 1);
  });

  it("Vérifie qu'on peut exporter les données au format CSV", async () => {
    const { httpClient } = await startServer();
    await insertCertificationsStats({
      millesime: "2020",
      code_formation: "12345678",
      filiere: "apprentissage",
      nb_annee_term: 1,
      nb_poursuite_etudes: 2,
      nb_en_emploi_12_mois: 3,
      nb_en_emploi_6_mois: 4,
      taux_poursuite_etudes: 5,
      taux_emploi_12_mois: 6,
      taux_emploi_6_mois: 7,
      taux_rupture_contrats: 8,
    });

    const response = await httpClient.get(`/api/inserjeunes/certifications.csv`, {
      headers: {
        ...getAuthHeaders(),
      },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.headers["content-type"], "text/csv; charset=UTF-8");
    assert.deepStrictEqual(
      response.data,
      `code_formation;filiere;millesime;nb_annee_term;nb_poursuite_etudes;nb_en_emploi_12_mois;nb_en_emploi_6_mois;taux_poursuite_etudes;taux_emploi_12_mois;taux_emploi_6_mois;taux_rupture_contrats
12345678;apprentissage;2020;1;2;3;4;5;6;7;8
`
    );
  });

  it("Vérifie qu'on retourne une 404 si les paramètres sont invalides", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get(`/api/inserjeunes/certifications?invalid=true`, {
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

    const response = await httpClient.get(`/api/inserjeunes/certifications`);

    assert.strictEqual(response.status, 401);
  });

  it("Vérifie qu'on peut passer l'apiKey en paramètre", async () => {
    const { httpClient } = await startServer();

    const response = await httpClient.get(`/api/inserjeunes/certifications?apiKey=${config.inserJeunes.api.key}`);

    assert.strictEqual(response.status, 200);
  });
});
