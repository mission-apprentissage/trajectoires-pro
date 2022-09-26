import { integer } from "./jsonSchemaTypes.js";
import { CUSTOM_STATS_NAMES, STATS_NAMES } from "../../../stats.js";

export function statsSchema() {
  const all = [...STATS_NAMES, ...CUSTOM_STATS_NAMES];

  return {
    ...all.reduce((acc, statName) => {
      return {
        ...acc,
        [statName]: integer(),
      };
    }, {}),
  };
}
