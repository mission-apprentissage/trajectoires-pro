import assert from "assert";
import { getDiplome } from "#src/services/bcn.js";

describe("bcn", () => {
  it("Permet de trouver un diplome avec un code formation", () => {
    const niveauxDiplome = [
      { niveau: "5XX", libelle_court: "CAP" },
      { niveau: "4XX", libelle_court: "BAC" },
      { niveau: "3XX", libelle_court: "BTS" },
      { niveau: "2XX", libelle_court: "LIC" },
      { niveau: "1XX", libelle_court: "MASTER" },
      { niveau: "0XX", libelle_court: "MC" },
    ];

    assert.deepStrictEqual(getDiplome(null), null);
    assert.deepStrictEqual(getDiplome(undefined), null);
    assert.deepStrictEqual(getDiplome("5XXXXXXXX", niveauxDiplome), { code: "3", libelle: "CAP" });
    assert.deepStrictEqual(getDiplome("4XXXXXXXX", niveauxDiplome), { code: "4", libelle: "BAC" });
    assert.deepStrictEqual(getDiplome("3XXXXXXXX", niveauxDiplome), { code: "5", libelle: "BTS" });
    assert.deepStrictEqual(getDiplome("2XXXXXXXX", niveauxDiplome), { code: "6", libelle: "LIC" });
    assert.deepStrictEqual(getDiplome("1XXXXXXXX", niveauxDiplome), { code: "7", libelle: "MASTER" });
    assert.deepStrictEqual(getDiplome("0XXXXXXX", niveauxDiplome), { code: "0", libelle: "MC" });
  });
});
