import { renderSVG } from "./templates/templates.js";
import { isNil } from "lodash-es";
import { findSeuil } from "./seuils.js";

function getNiveau(stats, name) {
  const seuil = findSeuil(stats, name);

  const found = seuil.niveaux.find((niveau) => {
    const value = stats[name];
    return niveau.min <= value && value <= niveau.max;
  });

  return found?.niveau;
}

export const prepareStatsForWidget = (stats) => {
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

export function isWidgetAvailable(stats) {
  return !!stats.taux_emploi_6_mois || !!stats.taux_poursuite_etudes;
}

export function buildWidget(templateName, data, options = {}) {
  return renderSVG(
    templateName,
    {
      stats: data.stats || [],
      description: data.description || {},
    },
    options
  );
}
