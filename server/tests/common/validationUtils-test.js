const assert = require("assert");
const { isUAIValid, isSiretValid } = require("../../src/common/utils/validationUtils");

describe("validationUtils", () => {
  it("permet de valider une UAI", () => {
    assert.strictEqual(isUAIValid("0010856A"), true);
    assert.strictEqual(isUAIValid("0000856A"), false);
    assert.strictEqual(isUAIValid("0010856B"), false);
    assert.strictEqual(isUAIValid("00108"), false);
    assert.strictEqual(isUAIValid(null), false);
    assert.strictEqual(isUAIValid(undefined), false);
    assert.strictEqual(isUAIValid(""), false);
  });

  it("permet de valider un siret", () => {
    assert.strictEqual(isSiretValid("11111111100006"), true);
    assert.strictEqual(isSiretValid("11111111100008"), false);
    assert.strictEqual(isSiretValid("111111111000"), false);
    assert.strictEqual(isSiretValid("111111111000XX"), false);
    assert.strictEqual(isSiretValid(null), false);
    assert.strictEqual(isSiretValid(undefined), false);
    assert.strictEqual(isSiretValid(""), false);
  });
});
