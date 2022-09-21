import { statsSchema } from "./db/collections/jsonSchema/statsSchema.js";
import { $field, $percentage, $sumOf } from "./utils/mongodbUtils.js";
import { omitNil } from "./utils/objectUtils.js";
import { percentage } from "./utils/numberUtils.js";

export const ALL = /.*/;
export const TAUX = /^taux_.*$/;
export const VALEURS = /^nb_.*$/;

export function getMillesimes() {
  return ["2018_2019", "2019_2020"];
}
export function getStatsNames(regex = ALL) {
  return Object.keys(statsSchema())
    .sort()
    .filter((k) => regex.test(k));
}

export function getIgnoredStatNames() {
  return [
    "taux_poursuite_etudes",
    "taux_emploi_24_mois",
    "taux_emploi_18_mois",
    "taux_emploi_12_mois",
    "taux_emploi_6_mois",
  ];
}

export function getReglesDeCalcul() {
  const taux = (dividend, divisor) => {
    return {
      compute: (data) => percentage(data[dividend], data[divisor]),
      aggregate: () => $percentage($field(dividend), $field(divisor)),
    };
  };

  const autres = (champ) => {
    return {
      compute: (data) => {
        const nbAutres = data.nb_annee_term - data[champ] - data.nb_poursuite_etudes;
        return percentage(nbAutres, data.nb_annee_term);
      },
      aggregate: () => {
        return $percentage(
          {
            $subtract: [{ $subtract: [$field("nb_annee_term"), $field(champ)] }, $field("nb_poursuite_etudes")],
          },
          $field("nb_annee_term")
        );
      },
    };
  };

  return {
    taux_en_emploi_24_mois: taux("nb_en_emploi_24_mois", "nb_annee_term"),
    taux_en_emploi_18_mois: taux("nb_en_emploi_18_mois", "nb_annee_term"),
    taux_en_emploi_12_mois: taux("nb_en_emploi_12_mois", "nb_annee_term"),
    taux_en_emploi_6_mois: taux("nb_en_emploi_6_mois", "nb_annee_term"),
    taux_en_formation: taux("nb_poursuite_etudes", "nb_annee_term"),
    taux_autres_6_mois: autres("nb_en_emploi_6_mois"),
    taux_autres_12_mois: autres("nb_en_emploi_12_mois"),
    taux_autres_18_mois: autres("nb_en_emploi_18_mois"),
    taux_autres_24_mois: autres("nb_en_emploi_24_mois"),
  };
}

export function getStats(regex, mapValue) {
  return getStatsNames(regex).reduce((acc, statName) => {
    const value = mapValue(statName);

    return {
      ...acc,
      ...(value ? { [statName]: value } : {}),
    };
  }, {});
}

export function computeCustomStats(data) {
  const regles = getReglesDeCalcul();

  return getStats(TAUX, (statName) => {
    const regle = regles[statName];
    const type = data === "aggregate" ? "aggregate" : "compute";

    return regle?.[type]?.(data) || null;
  });
}

export function buildDescription(stats) {
  const { code_certification, filiere, uai, millesime, diplome } = stats;
  return {
    titre: `Certification ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    details:
      `Données InserJeunes pour la certification ${code_certification} (${diplome.libelle} filière ${filiere})` +
      `${uai ? ` dispensée par l'établissement ${uai},` : ""} pour le millesime ${millesime}`,
  };
}

export async function getFilieresStats(collection, cfd, millesime) {
  const results = await collection
    .aggregate([
      {
        $match: { code_formation_diplome: cfd, ...(millesime ? { millesime } : {}) },
      },
      {
        $group: {
          _id: { filiere: "$filiere", millesime: "$millesime" },
          codes_certifications: { $addToSet: "$code_certification" },
          code_formation_diplome: { $first: "$code_formation_diplome" },
          filiere: { $first: "$filiere" },
          millesime: { $first: "$millesime" },
          diplome: { $first: "$diplome" },
          ...getStats(VALEURS, (statName) => $sumOf($field(statName))),
        },
      },
      {
        $addFields: {
          ...computeCustomStats("aggregate"),
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
