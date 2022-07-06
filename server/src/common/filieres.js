import { getMetadata } from "./metadata.js";
import { buildWidget, widgetifyStats } from "../http/widget/widget.js";
import { certificationsStats } from "./db/collections/collections.js";
import { omitNil } from "./utils/objectUtils.js";
import Boom from "boom";

function aggregateStats(stats) {
  if (stats.length === 0) {
    return null;
  }

  // aggregate numeric data
  const aggregatedStats = stats.reduce((acc, curr) => {
    acc["codes_certifications"] = [...(acc["codes_certifications"] ?? []), curr.code_certification];
    acc["millesime"] = curr.millesime;
    acc["filiere"] = curr.filiere;
    acc["diplome"] = curr.diplome;
    acc["nb_annee_term"] = (acc["nb_annee_term"] ?? 0) + (curr.nb_annee_term ?? 0);
    acc["nb_en_emploi_12_mois"] = (acc["nb_en_emploi_12_mois"] ?? 0) + (curr.nb_en_emploi_12_mois ?? 0);
    acc["nb_en_emploi_6_mois"] = (acc["nb_en_emploi_6_mois"] ?? 0) + (curr.nb_en_emploi_6_mois ?? 0);
    acc["nb_poursuite_etudes"] = (acc["nb_poursuite_etudes"] ?? 0) + (curr.nb_poursuite_etudes ?? 0);
    acc["nb_sortant"] = (acc["nb_sortant"] ?? 0) + (curr.nb_sortant ?? 0);
    return acc;
  }, {});

  // compute rates
  aggregatedStats["taux_emploi_12_mois"] = Math.round(
    (aggregatedStats.nb_en_emploi_12_mois / aggregatedStats.nb_sortant) * 100
  );
  aggregatedStats["taux_emploi_6_mois"] = Math.round(
    (aggregatedStats.nb_en_emploi_6_mois / aggregatedStats.nb_sortant) * 100
  );
  aggregatedStats["taux_poursuite_etudes"] = Math.round(
    (aggregatedStats.nb_poursuite_etudes / aggregatedStats.nb_annee_term) * 100
  );

  aggregatedStats._meta = getMetadata("certifications", stats);
  return aggregatedStats;
}

export function computeFilieresStats(statsArray) {
  const stats = statsArray.filter((s) => s.millesime === statsArray[0].millesime); // FIXME keep only one millesime
  const proStats = stats.filter(({ filiere }) => filiere === "pro");
  const apprentissageStats = stats.filter(({ filiere }) => filiere === "apprentissage");

  return omitNil({
    pro: aggregateStats(proStats),
    apprentissage: aggregateStats(apprentissageStats),
    _meta: getMetadata("certifications", stats),
  });
}

export async function sendFilieresStats(params, res) {
  const { codes_certifications, millesime, direction, theme, ext } = params;
  const results = await certificationsStats()
    .find(
      { code_certification: { $in: codes_certifications }, ...(millesime ? { millesime } : {}) },
      {
        projection: { _id: 0, _meta: 0 },
      }
    )
    .sort({ millesime: -1 })
    .toArray();

  if (results.length === 0) {
    throw Boom.notFound("Certifications inconnues");
  }

  const filiereStats = computeFilieresStats(results);

  if (ext !== "svg") {
    return res.json(filiereStats);
  } else {
    const data = {
      stats: {
        pro: widgetifyStats(filiereStats.pro),
        apprentissage: widgetifyStats(filiereStats.apprentissage),
      },
      meta: filiereStats._meta,
    };

    if (data.stats.pro.length === 0 && data.stats.apprentissage.length === 0) {
      throw Boom.notFound("Données non disponibles");
    }

    const widget = await buildWidget("filieres", data, { theme, direction });

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(widget);
  }
}
