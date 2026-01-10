import { integer } from "./jsonSchemaTypes.js";
import {
  INSERJEUNES_CUSTOM_STATS_NAMES,
  INSERSUP_CUSTOM_STATS_NAMES,
  INSERSUP_STATS_NAMES,
  INSERJEUNES_STATS_NAMES,
  INSERJEUNES_NATIONAL_STATS_NAMES,
} from "#src/common/stats.js";

export function statsSchema() {
  const all = [
    ...INSERJEUNES_STATS_NAMES,
    ...INSERJEUNES_NATIONAL_STATS_NAMES,
    ...INSERJEUNES_CUSTOM_STATS_NAMES,
    ...INSERSUP_CUSTOM_STATS_NAMES,
    ...INSERSUP_STATS_NAMES,
  ];

  return {
    ...all.reduce((acc, statName) => {
      return {
        ...acc,
        [statName]: integer(),
      };
    }, {}),
  };
}
