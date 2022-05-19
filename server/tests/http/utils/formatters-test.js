import assert from "assert";
import { formatMillesime } from "../../../src/http/utils/formatters.js";

describe("formatMillesime", () => {
  it("should not change correct format", () => {
    assert.deepStrictEqual(formatMillesime("2019_2020"), "2019_2020");
    assert.deepStrictEqual(["2020_2021", "2019_2020"].map(formatMillesime), ["2020_2021", "2019_2020"]);
  });

  it("should sort if necessary", () => {
    assert.deepStrictEqual(formatMillesime("2020_2019"), "2019_2020");
    assert.deepStrictEqual(["2021_2020", "2019_2018"].map(formatMillesime), ["2020_2021", "2018_2019"]);
  });

  it("should accept dash separated values", () => {
    assert.deepStrictEqual(formatMillesime("2020-2019"), "2019_2020");
    assert.deepStrictEqual(["2021-2020", "2019-2018"].map(formatMillesime), ["2020_2021", "2018_2019"]);
  });
});
