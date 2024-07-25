import { oleoduc, writeData, transformData, filterData } from "oleoduc";
import { updateOne } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { formationEtablissement } from "#src/common/db/collections/collections.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import { MIN_ELEVES_THRESHOLD } from "#src/common/constants/inserjeunes.js";
import { getLastMillesimesFormations } from "#src/common/stats.js";

const logger = getLoggerWithContext("import");

export async function importIndicateurPoursuite() {
  logger.info(`Importation des indicateurs de poursuite (données InserJeunes)`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await FormationEtablissementRepository.find(),
    transformData(async (formation) => {
      const formationsStats = await FormationStatsRepository.first({
        millesime: getLastMillesimesFormations(),
        nb_annee_term: { $gte: MIN_ELEVES_THRESHOLD },
        uai: formation.uai,
        code_certification: formation.voie === "scolaire" ? formation.mef11 : formation.cfd,
      });

      if (!formationsStats) {
        return null;
      }

      return {
        formation,
        formationsStats,
      };
    }),
    filterData((data) => data),
    writeData(
      async ({ formation, formationsStats }) => {
        const indicateurPoursuite = {
          millesime: formationsStats.millesime,
          taux_en_emploi_6_mois: formationsStats.taux_en_emploi_6_mois,
          taux_en_formation: formationsStats.taux_en_formation,
          taux_autres_6_mois: formationsStats.taux_autres_6_mois,
        };

        try {
          const res = await updateOne(
            formationEtablissement(),
            { _id: formation._id },
            {
              $set: {
                indicateurPoursuite: omitNil(indicateurPoursuite),
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Indicateur de poursuite ${formation.uai}/${formation.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Indicateur de poursuite ${formation.uai}/${formation.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Indicateur de poursuite ${formation.uai}/${formation.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de la poursuite ${formation.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
