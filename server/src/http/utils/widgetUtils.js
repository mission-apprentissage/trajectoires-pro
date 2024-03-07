import { buildDescriptionFiliere, buildDescription } from "#src/common/stats.js";
import { formatMillesime } from "#src/http/utils/formatters.js";

export async function formatDataWidget({ stats, millesime, region = null, etablissement = null }) {
  const description = buildDescription(stats);

  const data = {
    type: "",
    taux: [
      { name: "formation", value: stats.taux_en_formation },
      { name: "emploi", value: stats.taux_en_emploi_6_mois },
      { name: "autres", value: stats.taux_autres_6_mois },
    ],
    millesimes: formatMillesime(millesime).split("_"),
    description,
    // TODO: fix libelle BCN
    formationLibelle: stats.libelle,
    region,
    etablissementLibelle: etablissement?.appellation_officielle,
  };

  return data;
}

export async function formatDataFilieresWidget({ filieresStats, millesime, region = null }) {
  const { pro, apprentissage } = filieresStats;

  const data = {
    type: "filieres",
    pro: {
      exist: !!pro,
      taux: [
        { name: "formation", value: pro?.taux_en_formation },
        { name: "emploi", value: pro?.taux_en_emploi_6_mois },
        { name: "autres", value: pro?.taux_autres_6_mois },
      ],
    },
    apprentissage: {
      exist: !!apprentissage,
      taux: [
        { name: "formation", value: apprentissage?.taux_en_formation },
        { name: "emploi", value: apprentissage?.taux_en_emploi_6_mois },
        { name: "autres", value: apprentissage?.taux_autres_6_mois },
      ],
    },
    millesimes: formatMillesime(millesime).split("_"),
    description: buildDescriptionFiliere(pro, apprentissage),
    region: region,
  };

  return data;
}
