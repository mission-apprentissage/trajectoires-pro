import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("query");

export function filterTag(tag) {
  if (!tag) {
    return [];
  }

  const formationTag = Object.values(FORMATION_TAG).includes(tag);
  if (!formationTag) {
    logger.error(`Tag ${tag} inconnu dans les filtres de formations`);
    return [];
  }

  return [
    {
      $match: {
        "formation.tags": tag,
      },
    },
  ];
}
