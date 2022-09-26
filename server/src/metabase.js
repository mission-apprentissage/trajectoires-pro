import { writeFile } from "fs/promises";
import path from "path";

const consumer = `
[[
  {
    "$match": {{consumer}}
  },
]]
`;

//Suivi de la consommation globale de l'API
const getQueries = (filters) => {
  return {
    suiviConsommation: [
      {
        $match: {
          ...filters,
        },
      },
      {
        $group: {
          _id: {
            "time~~~day": {
              $let: {
                vars: {
                  parts: {
                    $dateToParts: {
                      date: "$time",
                    },
                  },
                },
                in: {
                  $dateFromParts: {
                    year: "$$parts.year",
                    month: "$$parts.month",
                    day: "$$parts.day",
                  },
                },
              },
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          _id: false,
          "time~~~day": "$_id.time~~~day",
          count: true,
        },
      },
      {
        $sort: {
          "time~~~day": 1,
        },
      },
    ],
    nbAppelsParCodeCertification: [
      {
        $match: {
          ...filters,
          code_certification: { $exists: true },
        },
      },
      {
        $group: {
          _id: "$code_certification",
          code_certification: { $first: "$code_certification" },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          code_certification: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ],
    nbAppelsParUaiEtCodeCertification: [
      {
        $match: {
          ...filters,
          uai: { $exists: true },
          code_certification: { $exists: true },
        },
      },
      {
        $group: {
          _id: { uai: "$uai", code_certification: "$code_certification" },
          uai: { $first: "$uai" },
          code_certification: { $first: "$code_certification" },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          uai: 1,
          code_certification: 1,
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ],
  };
};

export async function exportForMetabase(outputDir) {
  function writeQueries(type, queries) {
    return Object.keys(queries).map((queryName) => {
      const stages = queries[queryName].map((stage) => JSON.stringify(stage, null, 2));
      const content = `[${consumer}${stages.join(",\n")}]`;
      const filePath = path.join(outputDir, `${type}-${queryName}.json`);

      return writeFile(filePath, content).then(() => ({ [`${type}-${queryName}`]: "ok" }));
    }, {});
  }

  return Promise.all([
    ...writeQueries("api", getQueries({ extension: { $ne: "svg" } })),
    ...writeQueries("widget", getQueries({ extension: "svg" })),
  ]);
}
