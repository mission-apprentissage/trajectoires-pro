import { statsSchema } from "../db/collections/jsonSchema/statsSchema.js";

export function getStatsNames(options = {}) {
  return Object.keys(statsSchema()).filter((k) => (options.prefix ? k.startsWith(options.prefix) : k));
}

export function convertStatsNames(options, converter) {
  return getStatsNames(options).reduce((acc, statName) => {
    return {
      ...acc,
      [statName]: converter(statName),
    };
  }, {});
}
