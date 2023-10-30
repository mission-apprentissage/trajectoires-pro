import { integer } from "./jsonSchemaTypes.js";
import { CUSTOM_STATS_NAMES, INSERJEUNES_STATS_NAMES } from "#src/common/stats.js";

export function fields() {
  const all = [...INSERJEUNES_STATS_NAMES, ...CUSTOM_STATS_NAMES];

  return {
    ...all.reduce((acc, statName) => {
      return {
        ...acc,
        [statName]: integer(),
      };
    }, {}),
  };
}
