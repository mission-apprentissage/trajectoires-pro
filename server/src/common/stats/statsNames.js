import {
  tauxFormationStatsSchema,
  valeursFormationStatsSchema,
} from "../db/collections/jsonSchema/statsFormationSchema.js";

export function getStatsNames(options = {}) {
  return [tauxFormationStatsSchema(), valeursFormationStatsSchema()]
    .flatMap((res) => Object.keys(res))
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
