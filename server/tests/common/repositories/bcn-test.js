import deepEqualInAnyOrder from "deep-equal-in-any-order";
import chai from "chai";
import streamToArray from "stream-to-array";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import BCNRepository from "#src/common/repositories/bcn.js";

import { insertCFD, insertMEF } from "#tests/utils/fakeData.js";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("repositories", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("bcn", () => {
    describe("find", () => {
      it("Retourne la liste des formations sous forme de page", async () => {
        await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
        await insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345678" });

        const result = await BCNRepository.findAndPaginate({});
        assert.deepStrictEqual(result.pagination, {
          items_par_page: 10,
          nombre_de_page: 1,
          page: 1,
          total: 2,
        });

        const listes = await streamToArray(result.find);
        assert.deepEqualInAnyOrder(
          listes.map((l) => omit(l, "_id")),
          [
            {
              type: "cfd",
              code_certification: "12345678",
              code_formation_diplome: "12345678",
              libelle: "BAC PRO BATIMENT",
              libelle_long: "BAC PRO BATIMENT",
              diplome: { code: "4", libelle: "BAC" },
              date_ouverture: new Date(),
              nouveau_diplome: [],
              ancien_diplome: [],
              _meta: {
                date_import: new Date(),
                created_on: new Date(),
                updated_on: new Date(),
              },
            },
            {
              type: "mef",
              code_certification: "23830024202",
              code_formation_diplome: "12345678",
              date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
              diplome: { code: "4", libelle: "BAC" },
              libelle: "BAC PRO",
              libelle_long: "BAC PRO BATIMENT",
              date_ouverture: new Date(),
              nouveau_diplome: [],
              ancien_diplome: [],
              _meta: {
                date_import: new Date(),
                created_on: new Date(),
                updated_on: new Date(),
              },
            },
          ]
        );
      });
    });

    describe("findCodesFormationDiplome", () => {
      it("Retourne les CFDs correspondant aux codes de certifications", async () => {
        await insertCFD({ code_certification: "12345678", code_formation_diplome: "12345678" });
        await insertMEF({ code_certification: "23830024202", code_formation_diplome: "12345679" });

        const result = await BCNRepository.findCodesFormationDiplome(["12345678", "23830024202"]);
        assert.deepEqualInAnyOrder(result, ["12345678", "12345679"]);
      });
    });

    describe("cfdsParentAndChildren", () => {
      it("Retourne un tableau de CFDs avec les CFDs parents et enfants (continuum)", async () => {
        await insertCFD({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          ancien_diplome: ["10000002"],
          nouveau_diplome: ["10000003"],
        });
        await insertCFD({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          nouveau_diplome: ["10000001"],
        });
        await insertCFD({
          code_certification: "10000003",
          code_formation_diplome: "10000003",
          ancien_diplome: ["10000001"],
        });

        const cfds = await BCNRepository.cfdsParentAndChildren("10000001");
        assert.deepEqual(cfds, ["10000001", "10000002", "10000003"]);
      });

      it("Ne retourne pas les anciens et nouveaux CFDs lorsqu'il y a plusieurs anciens ou nouveaux CFDs", async () => {
        await insertCFD({
          code_certification: "10000001",
          code_formation_diplome: "10000001",
          ancien_diplome: ["10000002", "10000003"],
          nouveau_diplome: ["10000004", "10000005"],
        });
        await insertCFD({
          code_certification: "10000002",
          code_formation_diplome: "10000002",
          nouveau_diplome: ["10000001"],
        });
        await insertCFD({
          code_certification: "10000003",
          code_formation_diplome: "10000003",
          nouveau_diplome: ["10000001"],
        });

        await insertCFD({
          code_certification: "10000004",
          code_formation_diplome: "10000004",
          ancien_diplome: ["10000001"],
        });
        await insertCFD({
          code_certification: "10000005",
          code_formation_diplome: "10000005",
          ancien_diplome: ["10000001"],
        });

        const cfds = await BCNRepository.cfdsParentAndChildren("10000001");
        assert.deepEqual(cfds, ["10000001"]);
      });
    });
  });
});
