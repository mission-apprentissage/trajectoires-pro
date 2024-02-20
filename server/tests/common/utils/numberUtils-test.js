import assert from "assert";
import { percentage } from "#src/common/utils/numberUtils.js";

describe("numberUntils", () => {
  it("Vérifie que l'on arrondie les pourcentage au nombre pair le plus proche lorsque la décimale est .5", () => {
    const less5 = percentage(50.4, 100);
    assert.equal(less5, 50);
    const equal5RoundEvenInferior = percentage(50.5, 100);
    assert.equal(equal5RoundEvenInferior, 50);
    const equal5RoundEvenSuperior = percentage(51.5, 100);
    assert.equal(equal5RoundEvenSuperior, 52);
    const more5 = percentage(50.6, 100);
    assert.equal(more5, 51);
  });
});
