import assert from "assert";
import { prepareStatsForWidget } from "../../src/http/widget/widget.js";

describe("widget", () => {
  it("Doit calculer les taux pour le widget", () => {
    const stats = {
      code_certification: "50034303",
      diplome: { code: "3", libelle: "CAP" },
      filiere: "apprentissage",
      taux_emploi_6_mois: 80,
      taux_poursuite_etudes: 80,
    };

    assert.deepStrictEqual(prepareStatsForWidget(stats), [
      {
        valeur: 80,
        niveau: "success",
        libelles: ["sont en emploi 6 mois", "après la fin de la formation."],
      },
      {
        valeur: 80,
        niveau: "info",
        libelles: ["poursuivent leurs études."],
      },
    ]);
  });

  it("Doit calculer les taux pour le widget (warning)", () => {
    const stats = {
      code_certification: "50034303",
      diplome: { code: "3", libelle: "CAP" },
      filiere: "apprentissage",
      taux_emploi_6_mois: 25,
      taux_poursuite_etudes: 25,
    };

    const rates = prepareStatsForWidget(stats);

    assert.deepStrictEqual(rates[0].niveau, "warning");
    assert.deepStrictEqual(rates[1].niveau, "info");
  });

  it("Doit calculer les taux pour le widget (danger)", () => {
    const stats = {
      code_certification: "50034303",
      diplome: { code: "3", libelle: "CAP" },
      filiere: "apprentissage",
      taux_emploi_6_mois: 5,
      taux_poursuite_etudes: 5,
    };

    const rates = prepareStatsForWidget(stats);

    assert.deepStrictEqual(rates[0].niveau, "danger");
    assert.deepStrictEqual(rates[1].niveau, "info");
  });
});
