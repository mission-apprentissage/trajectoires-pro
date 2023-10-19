import assert from "assert";
import { pick } from "lodash-es";
import MockDate from "mockdate";
import { importLibelle } from "#src/jobs/bcn/importLibelle.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import { insertCFD, insertMEF } from "#tests/utils/fakeData.js";

describe("importLibelle", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("CFD", () => {
    it("Vérifie que l'on ajoute l'ancien libellé uniquement quand il est différent", async () => {
      await Promise.all([
        insertCFD({
          code_certification: "10000000",
          code_formation_diplome: "10000000",
          libelle_long: "BAC PRO ANCIEN",
        }),
        insertCFD({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          ancien_diplome: ["10000000"],
          nouveau_diplome: ["10000002"],
          libelle_long: "BAC PRO BATIMENT",
        }),
        insertCFD({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          ancien_diplome: ["10000001"],
          libelle_long: "BAC PRO BATIMENT NOUVEAU",
        }),
      ]);

      const stats = await importLibelle();
      assert.deepStrictEqual(stats, {
        total: 3,
        failed: 0,
        updated: 2,
      });

      const nouveau = await BCNRepository.first({ code_certification: "10000002" });
      assert.deepStrictEqual(pick(nouveau, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO BATIMENT NOUVEAU",
        libelle_long_ancien: "BAC PRO ANCIEN",
      });

      const ancien = await BCNRepository.first({ code_certification: "10000001" });
      assert.deepStrictEqual(pick(ancien, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO BATIMENT",
        libelle_long_ancien: "BAC PRO ANCIEN",
      });

      const ancien2 = await BCNRepository.first({ code_certification: "10000000" });
      assert.deepStrictEqual(pick(ancien2, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO ANCIEN",
      });
    });
  });

  describe("MEF", () => {
    it("Vérifie que l'on utilise les libellés des CFDs pour les MEFs", async () => {
      await Promise.all([
        insertCFD({
          code_certification: "10000000",
          code_formation_diplome: "10000000",
          libelle_long: "BAC PRO BATIMENT",
        }),

        insertMEF({
          code_certification: "10000000000",
          code_formation_diplome: "10000000",
          libelle_long: "BAC PRO MEF BATIMENT",
        }),
      ]);

      const stats = await importLibelle();
      assert.deepStrictEqual(stats, {
        total: 2,
        failed: 0,
        updated: 1,
      });

      const ancien2 = await BCNRepository.first({ code_certification: "10000000000" });
      assert.deepStrictEqual(pick(ancien2, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO BATIMENT",
      });
    });

    it("Vérifie que l'on ajoute l'ancien libellé uniquement quand il est différent", async () => {
      await Promise.all([
        insertCFD({
          code_certification: "10000000",
          code_formation_diplome: "10000000",
          libelle_long: "BAC PRO ANCIEN",
        }),
        insertCFD({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          ancien_diplome: ["10000000"],
          nouveau_diplome: ["10000002"],
          libelle_long: "BAC PRO BATIMENT",
          libelle_long_ancien: "BAC PRO ANCIEN",
        }),
        insertCFD({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          ancien_diplome: ["10000001"],
          libelle_long: "BAC PRO BATIMENT NOUVEAU",
          libelle_long_ancien: "BAC PRO ANCIEN",
        }),
        insertMEF({
          code_certification: "10000000000",
          code_formation_diplome: "10000000",
          nouveau_diplome: ["10000000001"],
          libelle_long: "BAC PRO MEF ANCIEN",
        }),
        insertMEF({
          code_certification: "10000000001",
          code_formation_diplome: "10000001",
          ancien_diplome: ["10000000000"],
          nouveau_diplome: ["10000000002"],
          libelle_long: "BAC PRO MEF BATIMENT",
        }),
        insertMEF({
          code_certification: "10000000002",
          code_formation_diplome: "10000002",
          ancien_diplome: ["10000000001"],
          libelle_long: "BAC PRO MEF BATIMENT NOUVEAU",
        }),
      ]);

      const stats = await importLibelle();
      assert.deepStrictEqual(stats, {
        total: 6,
        failed: 0,
        updated: 3,
      });

      const nouveau = await BCNRepository.first({ code_certification: "10000000002" });
      assert.deepStrictEqual(pick(nouveau, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO BATIMENT NOUVEAU",
        libelle_long_ancien: "BAC PRO ANCIEN",
      });

      const ancien = await BCNRepository.first({ code_certification: "10000000001" });
      assert.deepStrictEqual(pick(ancien, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO BATIMENT",
        libelle_long_ancien: "BAC PRO ANCIEN",
      });

      const ancien2 = await BCNRepository.first({ code_certification: "10000000000" });
      assert.deepStrictEqual(pick(ancien2, ["libelle_long", "libelle_long_ancien"]), {
        libelle_long: "BAC PRO ANCIEN",
      });
    });
  });
});
