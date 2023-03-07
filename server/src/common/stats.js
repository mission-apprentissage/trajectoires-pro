import { isNil, mapValues, flow, merge } from "lodash-es";
import { transformData } from "oleoduc";
import { $field, $percentage, $sumOf, $removeNullOrZero } from "./utils/mongodbUtils.js";
import { omitNil } from "./utils/objectUtils.js";
import { percentage } from "./utils/numberUtils.js";

export const INSERJEUNES_STATS_NAMES = [
  "nb_annee_term",
  "nb_en_emploi_24_mois",
  "nb_en_emploi_18_mois",
  "nb_en_emploi_12_mois",
  "nb_en_emploi_6_mois",
  "nb_poursuite_etudes",
  "nb_sortant",
  "taux_rupture_contrats",
];
export const INSERJEUNES_IGNORED_STATS_NAMES = [
  "taux_poursuite_etudes",
  "taux_emploi_24_mois",
  "taux_emploi_18_mois",
  "taux_emploi_12_mois",
  "taux_emploi_6_mois",
];
export const CUSTOM_STATS_NAMES = [
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

export const ALL = /.*/;
export const TAUX = /^taux_.*$/;
export const VALEURS = /^nb_.*$/;

export function getMillesimes() {
  return ["2019", "2020", "2021"];
}

export function getFormationMillesimes() {
  return ["2018_2019", "2019_2020", "2020_2021"];
}

function divide({ dividend, divisor }) {
  return {
    compute: (data) => percentage(data[dividend], data[divisor]),
    aggregate: () => $removeNullOrZero($field(divisor), $percentage($field(dividend), $field(divisor))),
  };
}

function percentageAndSubtract({ dividends, divisor, minuend }) {
  return {
    compute: (data) => {
      const sum = dividends.reduce((s, d) => {
        return s + percentage(data[d], data[divisor]);
      }, 0);
      return Math.max(minuend - sum, 0);
    },

    aggregate: () => {
      return $removeNullOrZero($field(divisor), {
        $max: [
          0,
          { $subtract: [minuend, { $sum: [...dividends.map((d) => $percentage($field(d), $field(divisor)))] }] },
        ],
      });
    },
  };
}

export function getReglesDeCalcul() {
  return {
    taux_en_emploi_24_mois: divide({ dividend: "nb_en_emploi_24_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_18_mois: divide({ dividend: "nb_en_emploi_18_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_12_mois: divide({ dividend: "nb_en_emploi_12_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_6_mois: divide({ dividend: "nb_en_emploi_6_mois", divisor: "nb_annee_term" }),
    taux_en_formation: divide({ dividend: "nb_poursuite_etudes", divisor: "nb_annee_term" }),
    taux_autres_6_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_6_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
    taux_autres_12_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_12_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
    taux_autres_18_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_18_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
    taux_autres_24_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_24_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
  };
}

export function filterStatsNames(regex = ALL) {
  return [...INSERJEUNES_STATS_NAMES, ...CUSTOM_STATS_NAMES].sort().filter((k) => regex.test(k));
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

export function getStatsCompute(regex, mapValue) {
  return filterStatsNames(regex).reduce((acc, statName) => {
    const value = mapValue(statName);
    return {
      ...acc,
      ...(isNaN(value) || isNil(value) ? {} : { [statName]: value }),
    };
  }, {});
}

export function computeCustomStats(data) {
  const type = data === "aggregate" ? "aggregate" : "compute";
  const regles = getReglesDeCalcul();

  if (type === "compute") {
    return getStatsCompute(TAUX, (statName) => {
      const regle = regles[statName];
      const result = regle?.[type]?.(data);
      return isNaN(result) || isNil(result) ? null : result;
    });
  }

  return getStats(TAUX, (statName) => {
    const regle = regles[statName];
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

  return mapValues(
    omitNil({
      pro: results[0]?.stats?.find((s) => s.filiere === "pro"),
      apprentissage: results[0]?.stats?.find((s) => s.filiere === "apprentissage"),
    }),
    transformDisplayStat()
  );
}

function transformDisplayStatRules() {
  const rules = [
    {
      // Remplace les taux par null si le nbr en année terminales < 20
      cond: (data) => data.nb_annee_term < 20,
      transformation: (data) => mapValues(data, (o, k) => (TAUX.test(k) ? null : o)),
      message: (data) =>
        merge(data, {
          _meta: {
            messages: [
              `Les taux ne peuvent pas être affichés car il n'y a pas assez d'élèves pour fournir une information fiable.`,
            ],
          },
        }),
    },
  ];

  return rules;
}

export function transformDisplayStat(isStream = false) {
  const ruleToFunc = ({ cond, transformation, message }) => {
    return (data) => (cond(data) ? flow(transformation, message)(data) : data);
  };
  const rules = transformDisplayStatRules().map(ruleToFunc);

  if (!isStream) {
    return flow(rules);
  }
  return transformData((data) => flow(rules)(data));
}
