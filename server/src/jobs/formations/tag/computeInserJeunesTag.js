import { isNil } from "lodash-es";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import { getLastMillesimesFormations } from "#src/common/stats.js";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("import");

export async function computeInserJeunesTag(
  formation,
  { thresholdEnEmploi = null, thresholdEnEtude = null } = {
    thresholdEnEmploi: null,
    thresholdEnEtude: null,
  }
) {
  const MIN_ELEVES_THRESHOLD = 20;

  if (isNil(thresholdEnEmploi) || isNil(thresholdEnEtude)) {
    logger.error("Seuil en emploi ou en étude non défini");
    return null;
  }

  const formationsStats = await FormationStatsRepository.first({
    millesime: getLastMillesimesFormations(),
    nb_annee_term: { $gte: MIN_ELEVES_THRESHOLD },
    uai: formation.uai,
    code_certification: formation.voie === "scolaire" ? formation.mef11 : formation.cfd,
  });

  if (!formationsStats) {
    return [];
  }

  return [
    ...(formationsStats.taux_en_emploi_6_mois >= thresholdEnEmploi ? [FORMATION_TAG.POUR_TRAVAILLER_RAPIDEMENT] : []),
    ...(formationsStats.taux_en_formation >= thresholdEnEtude ? [FORMATION_TAG.POUR_CONTINUER_DES_ETUDES] : []),
  ];
}
