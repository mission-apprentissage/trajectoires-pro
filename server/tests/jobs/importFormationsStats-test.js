import { assert } from "chai";
import { omit, pickBy } from "lodash-es";
import { importFormationsStats } from "../../src/jobs/importFormationsStats.js";
import { mockInserJeunesApi } from "../utils/apiMocks.js";
import { insertCFD, insertFormationsStats, insertMEF } from "../utils/fakeData.js";
import { formationsStats } from "../../src/common/db/collections/collections.js";

describe("importFormationsStats", () => {
  function mockApi(uai, millesime, response) {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/${uai}/millesime/${millesime}`)
        .query(() => true)
        .reply(200, responses.uai(response));
    });
  }

  it("Vérifie qu'on peut importer les stats d'une formation (apprentissage)", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          //ignored
          id_mesure: "taux_poursuite_etudes",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      diplome: {
        code: "4",
        libelle: "BAC",
      },
    });

    const stats = await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_certification: "12345678",
      code_formation_diplome: "12345678",
      millesime: "2018_2019",
      filiere: "apprentissage",
      nb_en_emploi_6_mois: 6,
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      region: {
        code: "76",
        nom: "Occitanie",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(found._meta.inserjeunes, {
      taux_poursuite_etudes: 6,
    });
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une formation (mefstats11)", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    const stats = await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(omit(found, ["_meta"]), {
      uai: "0751234J",
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      millesime: "2018_2019",
      filiere: "pro",
      nb_en_emploi_6_mois: 6,
      diplome: {
        code: "4",
        libelle: "BAC",
      },
      region: {
        code: "76",
        nom: "Occitanie",
      },
    });
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  describe("Vérifie que l'on calcule les nombres manquants quand cela est possible", () => {
    it("Ne calcule pas le nb_annee_term si on a le nb_poursuite_etudes et le nb_sortant", async () => {
      mockApi("0751234J", "2018_2019", {
        data: [
          {
            id_mesure: "nb_poursuite_etudes",
            valeur_mesure: 27,
            dimensions: [
              {
                id_mefstat11: "12345678900",
              },
            ],
          },
          {
            id_mesure: "nb_sortant",
            valeur_mesure: 9,
            dimensions: [
              {
                id_mefstat11: "12345678900",
              },
            ],
          },
        ],
      });
      await insertMEF({
        code_certification: "12345678900",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
      });

      await importFormationsStats({
        parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
      });

      const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
      assert.include(found, { nb_sortant: 9, nb_poursuite_etudes: 27 });
      assert.notProperty(found, "nb_annee_term");
    });

    it("Calcule le nb_poursuite_etudes si on a le nb_annee_term et le nb_sortant", async () => {
      mockApi("0751234J", "2018_2019", {
        data: [
          {
            id_mesure: "nb_annee_term",
            valeur_mesure: 27,
            dimensions: [
              {
                id_mefstat11: "12345678900",
              },
            ],
          },
          {
            id_mesure: "nb_sortant",
            valeur_mesure: 9,
            dimensions: [
              {
                id_mefstat11: "12345678900",
              },
            ],
          },
        ],
      });
      await insertMEF({
        code_certification: "12345678900",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
      });

      await importFormationsStats({
        parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
      });

      const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
      assert.include(found, { nb_annee_term: 27, nb_sortant: 9, nb_poursuite_etudes: 18, taux_en_formation: 67 });
    });

    it("Calcule le nb_sortant si on a le nb_annee_term et nb_poursuite_etudes", async () => {
      mockApi("0751234J", "2018_2019", {
        data: [
          {
            id_mesure: "nb_annee_term",
            valeur_mesure: 27,
            dimensions: [
              {
                id_mefstat11: "12345678900",
              },
            ],
          },
          {
            id_mesure: "nb_poursuite_etudes",
            valeur_mesure: 9,
            dimensions: [
              {
                id_mefstat11: "12345678900",
              },
            ],
          },
        ],
      });
      await insertMEF({
        code_certification: "12345678900",
        code_formation_diplome: "12345678",
        diplome: { code: "4", libelle: "BAC" },
      });

      await importFormationsStats({
        parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
      });

      const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
      assert.include(found, { nb_annee_term: 27, nb_sortant: 18, nb_poursuite_etudes: 9 });
    });
  });

  it("Vérifie qu'on recalcule les taux", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 10,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_poursuite_etudes",
          valeur_mesure: 50,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
        {
          id_mesure: "nb_annee_term",
          valeur_mesure: 100,
          dimensions: [
            {
              id_mefstat11: "12345678900",
            },
          ],
        },
      ],
    });
    await insertMEF({
      code_certification: "12345678900",
      code_formation_diplome: "12345678",
      diplome: { code: "4", libelle: "BAC" },
    });

    await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const found = await formationsStats().findOne({});
    const taux = pickBy(found, (value, key) => key.startsWith("taux"));
    assert.deepStrictEqual(taux, {
      taux_autres_6_mois: 40,
      taux_en_emploi_6_mois: 10,
      taux_en_formation: 50,
    });
  });

  it("Vérifie qu'on fusionne les mesures d'une formation", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678",
            },
          ],
        },
        {
          id_mesure: "nb_en_emploi_12_mois",
          valeur_mesure: 12,
          dimensions: [
            {
              id_mefstat11: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678" });

    const stats = await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.strictEqual(found.nb_en_emploi_6_mois, 6);
    assert.strictEqual(found.nb_en_emploi_12_mois, 12);
    assert.ok(found._meta.date_import);
    assert.deepStrictEqual(stats, { created: 1, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats de plusieurs formations", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 8,
          dimensions: [
            {
              id_formation_apprentissage: "87456123",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678" });
    await insertCFD({ code_certification: "87456123" });

    const stats = await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    let found = await formationsStats().findOne({ code_certification: "12345678" });
    assert.strictEqual(found.nb_en_emploi_6_mois, 6);
    found = await formationsStats().findOne({ code_certification: "87456123" });
    assert.strictEqual(found.nb_en_emploi_6_mois, 8);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut importer les stats d'une formation sur plusieurs millesimes", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    mockApi("0751234J", "2019_2020", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 8,
          dimensions: [
            {
              id_formation_apprentissage: "12345678",
            },
          ],
        },
      ],
    });
    await insertCFD({ code_certification: "12345678" });

    const stats = await importFormationsStats({
      parameters: [
        { uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" },
        { uai: "0751234J", region: "OCCITANIE", millesime: "2019_2020" },
      ],
    });

    let found = await formationsStats().findOne({ millesime: "2018_2019" });
    assert.strictEqual(found.nb_en_emploi_6_mois, 6);
    found = await formationsStats().findOne({ millesime: "2019_2020" });
    assert.strictEqual(found.nb_en_emploi_6_mois, 8);
    assert.deepStrictEqual(stats, { created: 2, failed: 0, updated: 0 });
  });

  it("Vérifie qu'on peut mettre à jour les stats d'une formation", async () => {
    mockApi("0751234J", "2018_2019", {
      data: [
        {
          id_mesure: "nb_en_emploi_6_mois",
          valeur_mesure: 6,
          dimensions: [
            {
              id_mefstat11: "12345678",
            },
          ],
        },
      ],
    });
    await insertFormationsStats({
      uai: "0751234J",
      code_certification: "12345678",
      millesime: "2018_2019",
      nb_en_emploi_6_mois: -1,
    });

    const stats = await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 6);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 1 });
  });

  it("Vérifie qu'on peut gèrer les erreurs 400 de l'api", async () => {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/0751234J/millesime/2018_2019`)
        .query(() => true)
        .reply(400, { msg: "UAI incorrect ou agricole" });
    });

    // Disable retry on InserJeunes API
    const stats = await importFormationsStats({
      inserjeunesOptions: { apiOptions: { retry: { retries: 0 } } },
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const count = await formationsStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });

  it("Vérifie qu'on peut gèrer un json invalide", async () => {
    mockInserJeunesApi((client, responses) => {
      client
        .post("/login")
        .query(() => true)
        .reply(200, responses.login());

      client
        .get(`/UAI/0751234J/millesime/2018_2019`)
        .query(() => true)
        .reply(200, "{json:");
    });

    const stats = await importFormationsStats({
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const count = await formationsStats().countDocuments({});
    assert.strictEqual(count, 0);
    assert.deepStrictEqual(stats, { created: 0, failed: 1, updated: 0 });
  });

  it("Réessai d'appeler l'api en cas d'erreur", async () => {
    mockInserJeunesApi(
      (client, responses) => {
        client
          .post("/login")
          .query(() => true)
          .reply(200, responses.login());

        client
          .get(`/UAI/0751234J/millesime/2018_2019`)
          .query(() => true)
          .replyWithError("error");

        client
          .get(`/UAI/0751234J/millesime/2018_2019`)
          .query(() => true)
          .reply(
            200,
            responses.uai({
              data: [
                {
                  id_mesure: "nb_en_emploi_6_mois",
                  valeur_mesure: 6,
                  dimensions: [
                    {
                      id_mefstat11: "12345678",
                    },
                  ],
                },
              ],
            })
          );
      },
      { stack: true }
    );

    await insertFormationsStats({
      uai: "0751234J",
      code_certification: "12345678",
      millesime: "2018_2019",
      nb_en_emploi_6_mois: -1,
    });

    // Change retry default timeout
    const stats = await importFormationsStats({
      inserjeunesOptions: { apiOptions: { retry: { minTimeout: 0 } } },
      parameters: [{ uai: "0751234J", region: "OCCITANIE", millesime: "2018_2019" }],
    });

    const found = await formationsStats().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found.nb_en_emploi_6_mois, 6);
    assert.deepStrictEqual(stats, { created: 0, failed: 0, updated: 1 });
  });
});
