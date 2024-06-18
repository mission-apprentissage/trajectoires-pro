import { oleoduc, writeData, transformData } from "oleoduc";
import { pick, flatten } from "lodash-es";
import { updateOne } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { formationEtablissement } from "#src/common/db/collections/collections.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement.js";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { computeInserJeunesTag } from "./computeInserJeunesTag.js";
import { computeIndicateurEntree } from "./computeIndicateurEntree.js";

const logger = getLoggerWithContext("import");

const COMPUTE_FORMATION_TAG = {
  inserjeunes: {
    tags: [FORMATION_TAG.POUR_TRAVAILLER_RAPIDEMENT, FORMATION_TAG.POUR_CONTINUER_DES_ETUDES],
    compute: async (
      formation,
      { thresholdEnEmploi, thresholdEnEtude } = { thresholdEnEmploi: 31, thresholdEnEtude: 64 }
    ) => {
      return computeInserJeunesTag(formation, { thresholdEnEmploi, thresholdEnEtude });
    },
  },
  indicateurEntree: {
    tags: [FORMATION_TAG.ADMISSION_FACILE],
    compute: async (formation, { thresholdTauxPression } = { thresholdTauxPression: 0.53 }) => {
      return computeIndicateurEntree(formation, { thresholdTauxPression });
    },
  },
};

export async function computeFormationTag() {
  logger.info(`Création des tags de formations`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await FormationEtablissementRepository.find({}),
    transformData(async (formation) => {
      const tags = flatten(
        await Promise.all(
          Object.values(COMPUTE_FORMATION_TAG).map(async (tag) => {
            const tags = await tag.compute(formation);
            if (!tags.every((tagComputed) => tag.tags.includes(tagComputed))) {
              throw new Error(`Tag inconnu dans ${tags.join(",")}`);
            }

            return tags;
          })
        )
      );
      return { formation, tags };
    }),
    writeData(
      async ({ formation, tags }) => {
        try {
          const res = await updateOne(
            formationEtablissement(),
            pick(formation, ["uai", "cfd", "voie", "codeDispositif"]),
            {
              $set: {
                tags,
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Tags de formation ${formation.uai}/${formation.cfd} ajoutés`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Tags de formation ${formation.uai}/${formation.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Tags de formation ${formation.uai}/${formation.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les tags de la formation ${formation.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
