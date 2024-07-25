import { isNil } from "lodash-es";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("import");

export async function computeIndicateurEntree(
  formation,
  { thresholdTauxPression = null } = {
    thresholdTauxPression: null,
  }
) {
  if (isNil(thresholdTauxPression)) {
    logger.error("Seuil pour le taux de pression non défini");
    return null;
  }

  const tauxPression = formation?.indicateurEntree?.tauxPression;

  if (isNil(tauxPression)) {
    return [];
  }

  if (tauxPression >= thresholdTauxPression) {
    return [];
  }

  return [FORMATION_TAG.ADMISSION_FACILE];
}
