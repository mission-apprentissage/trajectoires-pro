const assert = require("assert");
const {
  findRegionByUai,
  findRegionByName,
  findRegionByCodeInsee,
  findRegionByCode,
  findRegionByAcademie,
} = require("../../src/common/regions");

describe("regions", () => {
  it("Permet de trouver une région avec son UAI", () => {
    assert.deepStrictEqual(findRegionByUai("0751234J").nom, "Île-de-France");
    assert.deepStrictEqual(findRegionByUai("6200001G").nom, "Corse");
    assert.deepStrictEqual(findRegionByUai("9871234J").nom, "Collectivités d'outre-mer");
    assert.deepStrictEqual(findRegionByUai("UNKNOWN"), null);
  });

  it("Permet de trouver une région à partir d'un code INSEE", () => {
    assert.deepStrictEqual(findRegionByCodeInsee("97416").nom, "La Réunion");
    assert.deepStrictEqual(findRegionByCodeInsee("2B042").nom, "Corse");
    assert.deepStrictEqual(findRegionByCodeInsee("75001").nom, "Île-de-France");
  });

  it("Permet de trouver une région à partir du code de l'académie", () => {
    assert.deepStrictEqual(findRegionByAcademie("01").nom, "Île-de-France");
    assert.deepStrictEqual(findRegionByAcademie("16").nom, "Occitanie");
  });

  it("Permet de trouver une région avec son nom", () => {
    assert.deepStrictEqual(findRegionByName("Île-de-France").code, "11");
    assert.deepStrictEqual(findRegionByName("ILE-DE-FRANCE").code, "11");
  });

  it("Permet de trouver une région avec son code", () => {
    assert.deepStrictEqual(findRegionByCode("11").nom, "Île-de-France");
  });
});
