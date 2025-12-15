import assert from "assert";
import {
  findRegionByUai,
  findRegionByNom,
  findRegionByCodeInsee,
  findRegionByCode,
  findRegionByAcademie,
  findRegionByCodeRegionAcademique,
} from "#src/services/regions.js";

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

  it("Permet de trouver une région à partir d'un code INSEE3", () => {
    assert.deepStrictEqual(findRegionByCodeInsee(null), null);
    assert.deepStrictEqual(findRegionByCodeInsee("974").nom, "La Réunion");
    assert.deepStrictEqual(findRegionByCodeInsee("075").nom, "Île-de-France");
  });

  it("Permet de trouver une région à partir du code de l'académie", () => {
    assert.deepStrictEqual(findRegionByAcademie("01").nom, "Île-de-France");
    assert.deepStrictEqual(findRegionByAcademie("16").nom, "Occitanie");
  });

  it("Permet de trouver une région avec son nom", () => {
    assert.deepStrictEqual(findRegionByNom(null), null);
    assert.deepStrictEqual(findRegionByNom("Île-de-France").code, "11");
    assert.deepStrictEqual(findRegionByNom("ILE-DE-FRANCE").code, "11");
  });

  it("Permet de trouver une région avec son code", () => {
    assert.deepStrictEqual(findRegionByCode("11").nom, "Île-de-France");
  });

  it("Permet de trouver une région avec son code région académique", () => {
    assert.deepStrictEqual(findRegionByCodeRegionAcademique("01").nom, "Auvergne-Rhône-Alpes");
  });
});
