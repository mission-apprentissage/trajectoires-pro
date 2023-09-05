import assert from "assert";
import { capitalizeFirstLetter, dateAsString } from "#src/common/utils/stringUtils.js";

describe("stringUtils", () => {
  it("permet de mettre la première lettre en capital", () => {
    assert.strictEqual(capitalizeFirstLetter(null), null);
    assert.strictEqual(capitalizeFirstLetter(undefined), undefined);
    assert.strictEqual(capitalizeFirstLetter("test"), "Test");
    assert.strictEqual(capitalizeFirstLetter("Test"), "Test");
  });

  it("Permet de convertir une date en string", () => {
    assert.strictEqual(dateAsString(null), null);
    assert.strictEqual(dateAsString(undefined), undefined);
    assert.strictEqual(dateAsString(new Date("2022-09-01T14:00:00.000Z")), "2022-09-01");
  });
});
