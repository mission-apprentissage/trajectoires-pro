import assert from "assert";
import { prepareStatsForWidget } from "../../src/http/widget/widget.js";

describe("widget", () => {
  it("Doit calculer les taux pour le widget", () => {
    const stats = {
      code_certification: "50034303",
      diplome: { code: "3", libelle: "CAP" },
      filiere: "apprentissage",
      taux_en_emploi_6_mois: 80,
      taux_en_formation: 80,
    };

    assert.deepStrictEqual(prepareStatsForWidget(stats), {
      taux_en_emploi_6_mois: {
        valeur: 80,
      },
      taux_en_formation: {
        valeur: 80,
      },
    });
  });
});
