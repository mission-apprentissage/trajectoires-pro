import assert from "assert";
import MockDate from "mockdate";
import { omit } from "lodash-es";
import { insertBCNMEF, insertMEF } from "#tests/utils/fakeData.js";
import { importBCNFamilleMetier } from "#src/jobs/bcn/importBCNFamilleMetier.js";
import BCNRepository from "#src/common/repositories/bcn.js";

describe("importBCNFamilleMetier", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("Vérifie que l'on ajoute les familles de métiers", () => {
    it("Pour une seconde commune", async () => {
      await Promise.all([
        insertBCNMEF({
          mef_stat_11: "23810031211",
          formation_diplome: "40031211",
          mef: "2473121131",
        }),
        insertMEF({
          code_certification: "23810031211",
          code_formation_diplome: "40031211",
          libelle_long: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
        }),
      ]);

      const result = await importBCNFamilleMetier();

      assert.deepEqual(result, {
        failed: 0,
        total: 1,
        updated: 1,
      });

      const found = await BCNRepository.first({});
      assert.deepStrictEqual(omit(found, ["_id"]), {
        type: "mef",
        code_certification: "23810031211",
        code_formation_diplome: "40031211",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        date_ouverture: new Date(),
        diplome: { code: "4", libelle: "BAC" },
        libelle: "BAC PRO",
        libelle_long: "2NDPRO MET. RELATION CLIENT 2NDE COMMUNE",
        ancien_diplome: [],
        nouveau_diplome: [],
        familleMetier: {
          code: "003",
          isAnneeCommune: true,
          libelle: "Relation client",
        },
        _meta: {
          created_on: new Date("2023-01-01T00:00:00.000Z"),
          updated_on: new Date("2023-01-01T00:00:00.000Z"),
          date_import: new Date("2023-01-01T00:00:00.000Z"),
        },
      });
    });

    it("Pour une année d'option", async () => {
      await Promise.all([
        insertBCNMEF({
          mef_stat_11: "23830031212",
          formation_diplome: "40031211",
          mef: "2473121131",
        }),
        insertMEF({
          code_certification: "23830031212",
          code_formation_diplome: "40031211",
          libelle_long: "TERMINALE",
        }),
      ]);

      const result = await importBCNFamilleMetier();

      assert.deepEqual(result, {
        failed: 0,
        total: 1,
        updated: 1,
      });

      const found = await BCNRepository.first({});
      assert.deepStrictEqual(omit(found, ["_id"]), {
        type: "mef",
        code_certification: "23830031212",
        code_formation_diplome: "40031211",
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        date_ouverture: new Date(),
        diplome: { code: "4", libelle: "BAC" },
        libelle: "BAC PRO",
        libelle_long: "TERMINALE",
        ancien_diplome: [],
        nouveau_diplome: [],
        familleMetier: {
          code: "003",
          isAnneeCommune: true,
          libelle: "Relation client",
        },
        _meta: {
          created_on: new Date("2023-01-01T00:00:00.000Z"),
          updated_on: new Date("2023-01-01T00:00:00.000Z"),
          date_import: new Date("2023-01-01T00:00:00.000Z"),
        },
      });
    });
  });
});
