import { renderSVG } from "./templates/templates.js";
import { isNil, omitBy } from "lodash-es";

export const prepareStatsForWidget = (stats) => {
  return omitBy(
    {
      taux_en_emploi_6_mois: {
        valeur: stats.taux_en_emploi_6_mois,
      },
      taux_autres_6_mois: {
        valeur: stats.taux_autres_6_mois,
      },
      taux_en_formation: {
        valeur: stats.taux_en_formation,
      },
    },
    (t) => isNil(t.valeur)
  );
};

export function isWidgetAvailable(stats) {
  return !!stats && (!!stats.taux_en_emploi_6_mois || !!stats.taux_en_formation || !!stats.taux_autres_6_mois);
}

export function buildWidget(templateName, data, options = {}) {
  return renderSVG(
    templateName,
    {
      type: data.type || "",
      filiere: data.filiere || "",
      stats: data.stats || {},
      description: data.description || {},
      millesime: data.millesime || "",
      region: data.region || null,
      exist: data.exist || {},
    },
    options
  );
}
