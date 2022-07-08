import { statsSchema } from "../db/collections/jsonSchema/statsSchema.js";

export const ALL = {};
export const TAUX = { prefix: "taux_" };
export const VALEURS = { prefix: "nb_" };

export function getStatsNames(options = {}) {
  return Object.keys(statsSchema())
    .sort()
    .filter((k) => {
      return options.prefix ? k.startsWith(options.prefix) : k;
    });
}

export function convertStats(options, converter = (s) => s) {
  return getStatsNames(options).reduce((acc, statName) => {
    const value = converter(statName);
    return {
      ...acc,
      ...(value ? { [statName]: value } : {}),
    };
  }, {});
}

export function getTauxReglesDeCalcul(custom = {}) {
  return {
    taux_emploi_24_mois: { dividend: "nb_en_emploi_24_mois", divisor: "nb_sortant" },
    taux_emploi_18_mois: { dividend: "nb_en_emploi_18_mois", divisor: "nb_sortant" },
    taux_emploi_12_mois: { dividend: "nb_en_emploi_12_mois", divisor: "nb_sortant" },
    taux_emploi_6_mois: { dividend: "nb_en_emploi_6_mois", divisor: "nb_sortant" },
    taux_poursuite_etudes: { dividend: "nb_poursuite_etudes", divisor: "nb_annee_term" },
    ...custom,
  };
}
