import { oleoduc, transformData, writeData, flattenArray, filterData } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { uniq, omit, mapKeys, isNil } from "lodash-es";
import toArray from "stream-to-array";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import CAFormationRepository from "#src/common/repositories/CAFormation.js";

const logger = getLoggerWithContext("import");

function insertUai(result, handleError) {
  return async (data) => {
    result.total++;

    const query = {
      uai: data.uai,
      code_certification: data.code_certification,
      millesime: data.millesime,
    };

    try {
      const res = await upsert(formationsStats(), query, {
        $setOnInsert: {
          "_meta.date_import": new Date(),
          "_meta.created_on": new Date(),
          "_meta.updated_on": new Date(),
        },
        $set: omitNil({
          ...data,
        }),
      });

      if (res.upsertedCount) {
        logger.info("UAIs ajoutés", query);
        result.created++;
      } else if (res.modifiedCount) {
        result.updated++;
        logger.info("UAIs mis à jour", query);
      } else {
        logger.trace("UAIS déjà à jour", query);
      }
    } catch (e) {
      handleError(e, query);
    }
  };
}

async function computeUAIBase(millesime, result, handleError) {
  return oleoduc(
    await FormationStatsRepository.find({ millesime }),
    filterData((stats) => isNil(stats.uai_type)),
    transformData(
      async (stats) => {
        const { uai, code_formation_diplome, millesime, filiere } = stats;

        // On ne connait pas le type de l'uai pour le supérieur
        if (filiere === "superieur") {
          return {
            uai: stats.uai,
            uai_type: "inconnu",
            uai_donnee: stats.uai,
            uai_donnee_type: "inconnu",
            code_certification: stats.code_certification,
            millesime: millesime,
          };
        }

        // Le lieu de formation, le formateur et le gestionnaire sont identiques pour la voie scolaire
        if (filiere !== "apprentissage") {
          return {
            uai: stats.uai,
            uai_type: "lieu_formation",
            uai_donnee: stats.uai,
            uai_donnee_type: "lieu_formation",
            uai_formateur: [stats.uai],
            uai_gestionnaire: [stats.uai],
            code_certification: stats.code_certification,
            millesime: millesime,
          };
        }

        const cfdWithContinuum = await BCNRepository.cfdsParentAndChildren(code_formation_diplome);
        const uaisLieu = await CAFormationRepository.find({
          uai_formation: uai,
          cfd: cfdWithContinuum,
        }).then((stream) => toArray(stream));

        // Cas ou la donnée correspond au lieu de formation
        if (uaisLieu.length > 0) {
          return {
            uai: stats.uai,
            uai_type: "lieu_formation",
            uai_donnee: stats.uai,
            uai_donnee_type: "lieu_formation",
            uai_formateur: uniq(uaisLieu.map((u) => u.etablissement_formateur_uai).filter((v) => v)),
            uai_gestionnaire: uniq(uaisLieu.map((u) => u.etablissement_gestionnaire_uai).filter((v) => v)),
            code_certification: stats.code_certification,
            millesime: millesime,
          };
        }

        const uaisFormateur = await CAFormationRepository.find({
          etablissement_formateur_uai: uai,
          cfd: cfdWithContinuum,
        }).then((stream) => toArray(stream));
        if (uaisFormateur.length > 0) {
          return {
            uai: stats.uai,
            uai_type: "formateur",
            uai_donnee: stats.uai,
            uai_donnee_type: "formateur",
            uai_lieu_formation: uniq(uaisFormateur.map((u) => u.uai_formation).filter((v) => v)),
            uai_gestionnaire: uniq(uaisFormateur.map((u) => u.etablissement_gestionnaire_uai).filter((v) => v)),
            code_certification: stats.code_certification,
            millesime: millesime,
          };
        }

        const uaisGestionnaire = await CAFormationRepository.find({
          etablissement_gestionnaire_uai: uai,
          cfd: cfdWithContinuum,
        }).then((stream) => toArray(stream));
        if (uaisGestionnaire.length > 0) {
          return {
            uai: stats.uai,
            uai_type: "gestionnaire",
            uai_donnee: stats.uai,
            uai_donnee_type: "gestionnaire",
            uai_lieu_formation: uniq(uaisGestionnaire.map((u) => u.uai_formation).filter((v) => v)),
            uai_formateur: uniq(uaisGestionnaire.map((u) => u.etablissement_formateur_uai).filter((v) => v)),
            code_certification: stats.code_certification,
            millesime: millesime,
          };
        }

        return {
          uai: stats.uai,
          uai_type: "inconnu",
          uai_donnee: stats.uai,
          uai_donnee_type: "inconnu",
          code_certification: stats.code_certification,
          millesime: millesime,
        };
      },
      { parallel: 5 }
    ),
    writeData(insertUai(result, handleError))
  );
}

async function computeUAILieuFormation(millesime, result, handleError) {
  return oleoduc(
    await FormationStatsRepository.find({
      filiere: "apprentissage",
      millesime,
      uai_type: { $ne: "lieu_formation" },
    }),
    transformData(async (stats) => {
      const { uai_type, uai_lieu_formation, uai_formateur, uai_gestionnaire, millesime } = stats;

      if (!uai_lieu_formation || uai_lieu_formation.length === 0) {
        return [];
      }

      const lieuFormationToAdd = await Promise.all(
        uai_lieu_formation.map(async (uai_lieu) => {
          const alreadyExist = await FormationStatsRepository.first({
            uai: uai_lieu,
            millesime,
            code_certification: stats.code_certification,
            filiere: "apprentissage",
          });

          if (!alreadyExist) {
            return uai_lieu;
          }

          if (alreadyExist.uai_donnee_type === stats.uai_donnee_type && alreadyExist.uai_donnee === stats.uai_donnee) {
            return uai_lieu;
          }

          // N'écrase pas les données qui existent déjà pour un couple UAI/Code de certification
          return null;
        })
      );

      return lieuFormationToAdd
        .filter((l) => l)
        .map((uai_lieu) => {
          return {
            ...omit(stats, ["_id", "_meta", "uai_lieu_formation"]),
            uai: uai_lieu,
            uai_type: "lieu_formation",
            ...mapKeys(omit(stats._meta, ["created_on", "date_import", "updated_on"]), (value, key) => `_meta.${key}`),
            uai_formateur: uai_type === "formateur" ? [stats.uai] : uai_formateur,
            uai_gestionnaire: uai_type === "gestionnaire" ? [stats.uai] : uai_gestionnaire,
          };
        });
    }),
    flattenArray(),
    writeData(insertUai(result, handleError))
  );
}

export async function computeUAI(options = {}) {
  const result = { total: 0, created: 0, updated: 0, failed: 0 };
  const millesime = options.millesime || null;

  function handleError(e, context = {}) {
    logger.error({ err: e, ...context }, `Impossible d'associer les UAIs pour cette formation`);
    result.failed++;
    return null;
  }

  await computeUAIBase(millesime, result, handleError);

  await computeUAILieuFormation(millesime, result, handleError);

  return result;
}
