import assert from "assert";
import MockDate from "mockdate";
import { importBCNMEF } from "../../src/jobs/importBCNMEF.js";
import { bcnMef } from "../../src/common/db/collections/collections.js";
import { mockBCN } from "../utils/apiMocks.js";

describe("importBCNMEF", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les mefs", async () => {
    mockBCN((client) => {
      client.get("/CSV?n=N_MEF&separator=%7C").replyWithFile(200, "tests/fixtures/files/bcn/n_mef.csv");
    });

    let stats = await importBCNMEF();

    const found = await bcnMef().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      mef_stat_11: "12345678910",
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
      annee_dispositif: "9",
      commentaire: "Formation dont le niveau n est pas défini dans le privé hors contrat ou l instruction en famille",
      date_intervention: new Date("2021-09-10T00:00:00.000Z"),
      date_ouverture: new Date("2021-09-01T00:00:00.000Z"),
      date_fermeture: new Date("2021-09-01T00:00:00.000Z"),
      dispositif_formation: "123",
      duree_dispositif: "9",
      duree_projet: "0",
      duree_stage: "0",
      formation_diplome: "12345678",
      horaire: "N",
      libelle_court: "TEST",
      libelle_edition: "test",
      libelle_long: "TEST LONG",
      mef: "1234567890",
      mef_stat_9: "123456789",
      mef_inscription_scolarite: "O",
      nb_option_obligatoire: "0",
      nb_option_facultatif: "2",
      renforcement_langue: "N",
      statut_mef: "3",
    });
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });
});
