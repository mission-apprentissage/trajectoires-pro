import assert from "assert";
import MockDate from "mockdate";
import { importBCNMEF } from "#src/jobs/bcn/importBCNMEF.js";
import { bcnMef } from "#src/common/db/collections/collections.js";
import { mockBCN } from "#tests/utils/apiMocks.js";
import * as Fixtures from "#tests/utils/fixtures.js";

describe("importBCNMEF", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les mefs", async () => {
    await mockBCN(async (client) => {
      client.get("/nomenclature/N_MEF?schema=consultation").reply(200, await Fixtures.BCN("N_MEF"));
    });

    mockBCN((client) => {
      client.get("/CSV?n=N_MEF&separator=%7C").replyWithFile(200, "tests/fixtures/files/bcn/n_mef.csv");
    });

    let stats = await importBCNMEF();

    const found = await bcnMef().findOne({}, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      mef_stat_11: "99999999911",
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
      annee_dispositif: "1",
      commentaire: "Formation dont le niveau n est pas défini dans le privé hors contrat ou l instruction en famille",
      date_intervention: new Date("2024-11-26T00:00:00.000Z"),
      date_ouverture: new Date("2022-07-31T00:00:00.000Z"),
      date_fermeture: new Date("2022-08-31T00:00:00.000Z"),
      dispositif_formation: "254",
      duree_dispositif: "2",
      duree_projet: "0",
      duree_stage: "0",
      formation_diplome: "40023203",
      horaire: "N",
      libelle_court: "1BP2  33404",
      libelle_edition: "1bp2 gouvernante",
      libelle_long: "BAC PRO",
      mef: "999999991",
      mef_stat_9: "999999999",
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
