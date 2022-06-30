import { getTemplate, renderTemplate } from "./templates/templates.js";
import { isNil } from "lodash-es";
import { findSeuil } from "./seuils.js";
import Boom from "boom";

function getNiveau(stats, name) {
  const seuil = findSeuil(stats, name);

  const found = seuil.niveaux.find((niveau) => {
    const value = stats[name];
    return niveau.min <= value && value <= niveau.max;
  });

  return found?.niveau;
}

function widgetify(stats) {
  const data = { stats: widgetifyStats(stats), meta: stats._meta };
  if (data.stats.length === 0) {
    throw Boom.notFound("Données non disponibles");
  }
  return data;
}

export const widgetifyStats = (stats) => {
  return [
    {
      valeur: stats.taux_emploi_6_mois,
      libelles: ["sont en emploi 6 mois", "après la fin de la formation."],
      niveau: getNiveau(stats, "taux_emploi_6_mois"),
    },
    {
      valeur: stats.taux_poursuite_etudes,
      libelles: ["poursuivent leurs études."],
      niveau: "info",
    },
  ].filter((t) => !isNil(t.valeur));
};

export async function sendWidget(templateName, stats, res, options = {}) {
  const callback = options.widgetify || widgetify;
  const template = getTemplate(templateName, options);
  const svg = await renderTemplate(template, callback(stats));

  res.setHeader("content-type", "image/svg+xml");
  return res.status(200).send(svg);
}
