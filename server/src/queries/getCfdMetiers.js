import { dbCollection } from "#src/common/db/mongodb.js";
import * as CfdRomes from "#src/common/db/collections/cfdRomes.js";
import { compose, transformData, filterData } from "oleoduc";
import { pick } from "lodash-es";

export async function getCfdMetiers() {
  const request = await dbCollection(CfdRomes.name)
    .aggregate([
      {
        $match: {
          romes: { $not: { $size: 0 } },
        },
      },
      {
        $lookup: {
          from: "romeMetier",
          localField: "code_romes",
          foreignField: "code_rome",
          as: "metiers",
        },
      },
    ])
    .stream();

  return compose(
    request,
    filterData((data) => data.metiers.length > 0),
    transformData((data) => {
      return pick(data, ["code_formation_diplome", "code_romes", "metiers"]);
    }),
    transformData((data) => {
      return {
        ...data,
        metiers: data.metiers.map((metier) => pick(metier, "code_rome", "title", "isMetierAvenir")),
      };
    })
  );
}
