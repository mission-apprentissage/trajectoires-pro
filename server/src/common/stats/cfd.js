import { buildWidget, isWidgetAvailable, prepareStatsForWidget } from "../../http/widget/widget.js";
import { certificationsStats } from "../db/collections/collections.js";
import Boom from "boom";
import { omitNil } from "../utils/objectUtils.js";
import { $tauxStats, $valeursStats } from "../utils/mongodbUtils.js";
import { isEmpty } from "lodash-es";

export async function getCFDStats(cfd, millesime) {
  const results = await certificationsStats()
    .aggregate([
      {
        $match: { code_formation_diplome: cfd, ...(millesime ? { millesime } : {}) },
      },
      {
        $group: {
          _id: { filiere: "$filiere", millesime: "$millesime" },
          codes_certifications: { $push: "$code_certification" },
          code_formation_diplome: { $first: "$code_formation_diplome" },
          filiere: { $first: "$filiere" },
          millesime: { $first: "$millesime" },
          diplome: { $first: "$diplome" },
          ...$valeursStats(),
        },
      },
      {
        $addFields: {
          ...$tauxStats(),
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $group: {
          _id: "$millesime",
          stats: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ])
    .limit(1)
    .toArray();

  return omitNil({
    pro: results[0]?.stats?.find((s) => s.filiere === "pro"),
    apprentissage: results[0]?.stats?.find((s) => s.filiere === "apprentissage"),
  });
}

export async function sendCFDStats(cfdStats, res, options = {}) {
  const { direction, theme, ext } = options;

  if (isEmpty(cfdStats)) {
    throw Boom.notFound("Certifications inconnues");
  }

  if (ext !== "svg") {
    return res.json(cfdStats);
  } else {
    if (!isWidgetAvailable(cfdStats.pro) && !isWidgetAvailable(cfdStats.apprentissage)) {
      throw Boom.notFound("Données non disponibles");
    }

    const widget = await buildWidget(
      "cfd",
      {
        stats: {
          pro: prepareStatsForWidget(cfdStats.pro),
          apprentissage: prepareStatsForWidget(cfdStats.apprentissage),
        },
      },
      { theme, direction }
    );

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(widget);
  }
}
