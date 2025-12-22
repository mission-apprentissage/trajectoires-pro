import assert from "assert";
import MockDate from "mockdate";
import { importBCNSise } from "#src/jobs/bcn/importBCNSise.js";
import { bcnSise } from "#src/common/db/collections/collections.js";
import { mockBCN } from "#tests/utils/apiMocks.js";
import * as Fixtures from "#tests/utils/fixtures.js";

describe("importBCNSise", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les sises", async () => {
    await mockBCN(async (client) => {
      client
        .get("/nomenclature/N_TYPE_DIPLOME_SISE?schema=consultation")
        .reply(200, await Fixtures.BCN("N_TYPE_DIPLOME_SISE"));

      client.get("/nomenclature/N_DIPLOME_SISE?schema=consultation").reply(200, await Fixtures.BCN("N_DIPLOME_SISE"));
    });

    let stats = await importBCNSise();

    const found = await bcnSise().findOne({ diplome_sise: "2001235" }, { projection: { _id: 0 } });
    assert.deepStrictEqual(found, {
      _meta: {
        created_on: new Date(),
        date_import: new Date(),
        updated_on: new Date(),
      },
      cite_domaine_detaille: "0841",
      cite_domaine_formation: "341",
      date_ouverture: new Date("2009-09-01T00:00:00.000Z"),
      date_fermeture: new Date("2000-08-31T00:00:00.000Z"),
      date_intervention: new Date("2012-10-31T00:00:00.000Z"),
      definitif: "O",
      diplome: {
        code: "6",
        libelle: "LIC (IUP)",
      },
      diplome_sise: "2001235",
      groupe_specialite: "312",
      lettre_specialite: "P",
      libelle_intitule_1: "INGENIERIE DU COMMERCE ET DE LA VENTE",
      libelle_intitule_2: "GESTION COMMERCIALE DES P M E",
      secteur_discipl_detail_sise: "39",
      secteur_disciplinaire_sise: "39",
      type_diplome_sise: "DJ",
    });
    assert.deepStrictEqual(stats, {
      created: 4, // Ce nombre inclus les 3 diplomes injectés
      failed: 0,
      updated: 0,
      total: 4,
    });
  });
});
