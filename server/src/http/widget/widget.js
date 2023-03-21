import { renderSVG } from "./templates/templates.js";
import { isNil, omitBy } from "lodash-es";
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
  return omitBy(
    {
      taux_en_emploi_6_mois: {
        valeur: stats.taux_en_emploi_6_mois,
        libelles: ["sont en emploi 6 mois", "après la fin de la formation."],
        niveau: getNiveau(stats, "taux_en_emploi_6_mois"),
      },
      taux_autres_6_mois: {
        valeur: stats.taux_autres_6_mois,
        libelles: ["sont en emploi 6 mois", "après la fin de la formation."],
        niveau: getNiveau(stats, "taux_autres_6_mois"),
      },
      taux_en_formation: {
        valeur: stats.taux_en_formation,
        libelles: ["poursuivent leurs études."],
        niveau: "info",
      },
    },
    (t) => isNil(t.valeur)
  );
};

export function isWidgetAvailable(stats) {
  return !!stats.taux_en_emploi_6_mois || !!stats.taux_en_formation || !!stats.taux_autres_6_mois;
}

export function buildWidget(templateName, data, options = {}) {
  return renderSVG(
    templateName,
    {
      stats: data.stats || {},
      description: data.description || {},
      millesime: data.millesime || "",
      region: data.region || null,
    },
    options
  );
}
