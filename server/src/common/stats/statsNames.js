import { schema as formationSchema } from "../db/collections/formationsStats.js";

export function getStatsNames(options = {}) {
  return Object.keys(formationSchema().properties)
    .filter((k) => {
      return k.startsWith("taux_") || k.startsWith("nb_");
    })
    .filter((k) => (options.prefix ? k.startsWith(options.prefix) : k));
}

export function convertStatsNames(options, converter) {
  return getStatsNames(options).reduce((acc, statName) => {
    return {
      ...acc,
      [statName]: converter(statName),
    };
  }, {});
}
