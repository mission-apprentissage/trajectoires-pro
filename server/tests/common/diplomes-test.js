import assert from "assert";
import { getDiplome } from "../../src/common/diplomes.js";

describe("bcn", () => {
  it("Permet de trouver un diplome avec un code formation", () => {
    assert.deepStrictEqual(getDiplome(null), null);
    assert.deepStrictEqual(getDiplome(undefined), null);
    assert.deepStrictEqual(getDiplome("5XXXXXXXX"), { code: "3", libelle: "CAP" });
    assert.deepStrictEqual(getDiplome("4XXXXXXXX"), { code: "4", libelle: "BAC" });
    assert.deepStrictEqual(getDiplome("3XXXXXXXX"), { code: "5", libelle: "BTS" });
    assert.deepStrictEqual(getDiplome("2XXXXXXXX"), { code: "6", libelle: "LIC" });
    assert.deepStrictEqual(getDiplome("1XXXXXXXX"), { code: "7", libelle: "MASTER" });
    assert.deepStrictEqual(getDiplome("0XXXXXXX"), { code: "0", libelle: "MC" });
  });
});
