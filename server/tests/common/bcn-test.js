import assert from "assert";
import { asDiplome } from "../../src/common/bcn.js";

describe("bcn", () => {
  it("Permet de trouver un diplome avec un code formation", () => {
    assert.deepStrictEqual(asDiplome(null), null);
    assert.deepStrictEqual(asDiplome(undefined), null);
    assert.deepStrictEqual(asDiplome("5XXXXXXXX"), { code: "3", libelle: "CAP" });
    assert.deepStrictEqual(asDiplome("4XXXXXXXX"), { code: "4", libelle: "BAC" });
    assert.deepStrictEqual(asDiplome("3XXXXXXXX"), { code: "5", libelle: "BTS" });
    assert.deepStrictEqual(asDiplome("2XXXXXXXX"), { code: "6", libelle: "LIC" });
    assert.deepStrictEqual(asDiplome("1XXXXXXXX"), { code: "7", libelle: "MASTER" });
    assert.deepStrictEqual(asDiplome("0XXXXXXX"), { code: "0", libelle: "MC" });
  });
});
