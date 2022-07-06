import { buildWidget, isWidgetAvailable, prepareStatsForWidget } from "../../http/widget/widget.js";
import { certificationsStats } from "../db/collections/collections.js";
import Boom from "boom";
import { omitNil } from "../utils/objectUtils.js";
import { percentage, sumOf } from "../utils/mongodbUtils.js";
import { isEmpty } from "lodash-es";

async function getFilieresStats(codes_certifications, millesime) {
  const results = await certificationsStats()
    .aggregate([
      {
        $match: { code_certification: { $in: codes_certifications }, ...(millesime ? { millesime } : {}) },
      },
      {
        $group: {
          _id: { filiere: "$filiere", millesime: "$millesime" },
          codes_certifications: { $push: "$code_certification" },
          filiere: { $first: "$filiere" },
          millesime: { $first: "$millesime" },
          diplome: { $first: "$diplome" },
          nb_annee_term: sumOf("$nb_annee_term"),
          nb_en_emploi_12_mois: sumOf("$nb_en_emploi_12_mois"),
          nb_en_emploi_6_mois: sumOf("$nb_en_emploi_6_mois"),
          nb_poursuite_etudes: sumOf("$nb_poursuite_etudes"),
          nb_sortant: sumOf("$nb_sortant"),
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$$ROOT",
              {
                taux_emploi_12_mois: percentage("$nb_en_emploi_12_mois", "$nb_sortant"),
                taux_emploi_6_mois: percentage("$nb_en_emploi_6_mois", "$nb_sortant"),
                taux_poursuite_etudes: percentage("$nb_poursuite_etudes", "$nb_annee_term"),
              },
            ],
          },
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

export async function sendFilieresStats(params, res) {
  const { codes_certifications, millesime, direction, theme, ext } = params;

  let filliereStats = await getFilieresStats(codes_certifications, millesime);

  if (isEmpty(filliereStats)) {
    throw Boom.notFound("Certifications inconnues");
  }

  if (ext !== "svg") {
    return res.json(filliereStats);
  } else {
    if (!isWidgetAvailable(filliereStats.pro) && !isWidgetAvailable(filliereStats.apprentissage)) {
      throw Boom.notFound("Données non disponibles");
    }

    const widget = await buildWidget(
      "filieres",
      {
        stats: {
          pro: prepareStatsForWidget(filliereStats.pro),
          apprentissage: prepareStatsForWidget(filliereStats.apprentissage),
        },
      },
      { theme, direction }
    );

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(widget);
  }
}
