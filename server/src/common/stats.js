import { $field, $percentage, $sumOf } from "./utils/mongodbUtils.js";
import { omitNil } from "./utils/objectUtils.js";
import { percentage } from "./utils/numberUtils.js";

export const STATS_NAMES = [
  "nb_annee_term",
  "nb_en_emploi_24_mois",
  "nb_en_emploi_18_mois",
  "nb_en_emploi_12_mois",
  "nb_en_emploi_6_mois",
  "nb_poursuite_etudes",
  "nb_sortant",
  "taux_rupture_contrats",
  //Custom stats
  "taux_en_formation",
  "taux_en_emploi_24_mois",
  "taux_en_emploi_18_mois",
  "taux_en_emploi_12_mois",
  "taux_en_emploi_6_mois",
  "taux_autres_6_mois",
  "taux_autres_12_mois",
  "taux_autres_18_mois",
  "taux_autres_24_mois",
];
export const IGNORED_STATS_NAMES = [
  "taux_poursuite_etudes",
  "taux_emploi_24_mois",
  "taux_emploi_18_mois",
  "taux_emploi_12_mois",
  "taux_emploi_6_mois",
];
export const ALL = /.*/;
export const TAUX = /^taux_.*$/;
export const VALEURS = /^nb_.*$/;

export function getMillesimes() {
  return ["2018_2019", "2019_2020"];
}
function taux({ dividend, divisor }) {
  return {
    compute: (data) => percentage(data[dividend], data[divisor]),
    aggregate: () => $percentage($field(dividend), $field(divisor)),
  };
}

function tauxAutres({ dividend, divisor }) {
  return {
    compute: (data) => {
      const nbAutres = dividend.map((d) => data[d]).reduce((acc, value) => acc - value);

      return percentage(nbAutres, data[divisor]);
    },
    aggregate: () => {
      return $percentage(
        {
          $subtract: [{ $subtract: [$field(dividend[0]), $field(dividend[1])] }, $field(dividend[2])],
        },
        $field(divisor)
      );
    },
  };
}

export function getReglesDeCalcul() {
  return {
    taux_en_emploi_24_mois: taux({ dividend: "nb_en_emploi_24_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_18_mois: taux({ dividend: "nb_en_emploi_18_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_12_mois: taux({ dividend: "nb_en_emploi_12_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_6_mois: taux({ dividend: "nb_en_emploi_6_mois", divisor: "nb_annee_term" }),
    taux_en_formation: taux({ dividend: "nb_poursuite_etudes", divisor: "nb_annee_term" }),
    taux_autres_6_mois: tauxAutres({
      dividend: ["nb_annee_term", "nb_en_emploi_6_mois", "nb_poursuite_etudes"],
      divisor: "nb_annee_term",
    }),
    taux_autres_12_mois: tauxAutres({
      dividend: ["nb_annee_term", "nb_en_emploi_12_mois", "nb_poursuite_etudes"],
      divisor: "nb_annee_term",
    }),
    taux_autres_18_mois: tauxAutres({
      dividend: ["nb_annee_term", "nb_en_emploi_18_mois", "nb_poursuite_etudes"],
      divisor: "nb_annee_term",
    }),
    taux_autres_24_mois: tauxAutres({
      dividend: ["nb_annee_term", "nb_en_emploi_24_mois", "nb_poursuite_etudes"],
      divisor: "nb_annee_term",
    }),
  };
}

export function filterStatsNames(regex = ALL) {
  return STATS_NAMES.sort().filter((k) => regex.test(k));
}

export function getStats(regex, mapValue) {
  return filterStatsNames(regex).reduce((acc, statName) => {
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
