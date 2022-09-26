import { integer } from "./jsonSchemaTypes.js";
import { STATS_NAMES } from "../../../stats.js";

export function statsSchema() {
  return {
    ...STATS_NAMES.reduce((acc, statName) => {
      return {
        ...acc,
        [statName]: integer(),
      };
    }, {}),
  };
}
