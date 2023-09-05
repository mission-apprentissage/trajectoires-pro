import chai from "chai";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import streamToArray from "stream-to-array";
import { insertCfdRomes, insertRomeMetier } from "#tests/utils/fakeData.js";
import { getCfdMetiers } from "#src/queries/getCfdMetiers.js";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("getCfdMetiers", () => {
  it("Retourne une liste de diplomes avec ces codes ROMEs et métiers associés", async () => {
    await insertCfdRomes({ code_romes: ["A1000"], code_formation_diplome: "10000000" });
    await insertCfdRomes({ code_romes: ["B2000"], code_formation_diplome: "20000000" });
    await insertRomeMetier({ code_rome: "A1000" });
    await insertRomeMetier({ code_rome: "B2000" });

    const cfdMetiers = await streamToArray(await getCfdMetiers());
    assert.deepEqualInAnyOrder(cfdMetiers, [
      {
        code_formation_diplome: "10000000",
        code_romes: ["A1000"],
        metiers: [
          {
            code_rome: "A1000",
            title: "Céréalier / Céréalière",
            isMetierAvenir: true,
          },
        ],
      },
      {
        code_formation_diplome: "20000000",
        code_romes: ["B2000"],
        metiers: [
          {
            code_rome: "B2000",
            title: "Céréalier / Céréalière",
            isMetierAvenir: true,
          },
        ],
      },
    ]);
  });
});
