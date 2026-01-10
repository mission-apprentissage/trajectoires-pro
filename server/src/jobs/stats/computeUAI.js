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
import config from "#src/config.js";

const logger = getLoggerWithContext("import");

function insertUai(result, handleError) {
  return async (data) => {
    result.total++;

    const query = {
      uai: data.uai,
      code_certification: data.code_certification,
      millesime: data.millesime,
      filiere: data.filiere,
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
            filiere: stats.filiere,
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
            filiere: stats.filiere,
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
            filiere: stats.filiere,
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
            filiere: stats.filiere,
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
            filiere: stats.filiere,
          };
        }

        return {
          uai: stats.uai,
          uai_type: "inconnu",
          uai_donnee: stats.uai,
          uai_donnee_type: "inconnu",
          code_certification: stats.code_certification,
          millesime: millesime,
          filiere: stats.filiere,
        };
      },
      { parallel: 5 }
    ),
    writeData(insertUai(result, handleError))
  );
}

async function computeUaiFormateur(millesime, result, handleError) {
  return oleoduc(
    // Récupère tout les UAIs dont le lieu de formation est identique à l'uai formateur
    await FormationStatsRepository.find({
      filiere: "apprentissage",
      millesime,
      uai_type: { $eq: "lieu_formation" },
      uai_formateur: { $size: 1 },
      $expr: {
        $eq: [{ $arrayElemAt: ["$uai_formateur", 0] }, "$uai"],
      },
    }),
    // Pour chaque element on regarde si le formateur à d'autre enfant pour ce cfd et cet uai en formateur
    transformData(async (data) => {
      const cfdWithContinuum = await BCNRepository.cfdsParentAndChildren(data.code_formation_diplome);
      const uaisWithFormateur = await CAFormationRepository.find({
        etablissement_formateur_uai: data.uai,
        uai_formation: { $ne: data.uai, $exists: true },
        cfd: cfdWithContinuum,
      })
        .then((stream) => toArray(stream))
        // Retirer ceux qui ont de la donnée au niveau lieu de formation
        .then(async (uaisWithFormateur) => {
          const results = [];
          // Ensemble des lieux de formation associé à ce formateur
          const resultsLieux = [data.uai];

          for (const uaiWithFormateur of uaisWithFormateur) {
            resultsLieux.push(uaiWithFormateur.uai_formation);

            const hasData = await FormationStatsRepository.first({
              code_certification: data.code_certification,
              uai: uaiWithFormateur.uai_formation,
              millesime,
              filiere: data.filiere,
            });

            if (!hasData) {
              results.push(uaiWithFormateur);
            }
          }

          return { results, resultsLieux };
        });
      return { data, cfdWithContinuum, uaisWithFormateur: uaisWithFormateur };
    }),
    filterData(({ uaisWithFormateur }) => uaisWithFormateur.results.length > 0),
    writeData(async ({ data, uaisWithFormateur }) => {
      try {
        // On a au moin un autre lieu de formation sans donnée, on associe donc cette donnée avec un type formateur
        const res = await FormationStatsRepository.updateOne(
          {
            uai: data.uai,
            millesime: data.millesime,
            code_certification: data.code_certification,
            filiere: data.filiere,
          },
          {
            uai_donnee_type: "formateur",
            uai_type: "formateur",
            uai_lieu_formation: uniq(uaisWithFormateur.resultsLieux.filter((u) => !!u)),
          }
        );

        if (res.modifiedCount) {
          logger.info(`Type de l'UAI mise à jour (lieu_formation vers formateur)`, {
            uai: data.uai,
            code_certification: data.code_certification,
          });
          result.lieu_formation_to_formateur++;
        } else {
          logger.trace(`Type de l'UAI (lieu_formation vers formateur) déjà à jour`, {
            uai: data.uai,
            code_certification: data.code_certification,
          });
        }
      } catch (e) {
        handleError(e, data);
      }
    })
  );
}

async function computeUaiGestionnaire(millesime, result, handleError) {
  return oleoduc(
    // Récupère tout les UAIs dont le type est uai formateur et dont l'uai formateur est identique à l'uai gestionnaire
    await FormationStatsRepository.find({
      filiere: "apprentissage",
      millesime,
      uai_type: { $eq: "formateur" },
      uai_gestionnaire: { $size: 1 },
      $expr: {
        $eq: [{ $arrayElemAt: ["$uai_gestionnaire", 0] }, "$uai"],
      },
    }),
    // Pour chaque element on regarde si le gestionnaire à d'autre enfant pour ce cfd et cet uai en gestionnaire
    transformData(async (data) => {
      const cfdWithContinuum = await BCNRepository.cfdsParentAndChildren(data.code_formation_diplome);
      const uaisWithGestionnaire = await CAFormationRepository.find({
        etablissement_gestionnaire_uai: data.uai,
        etablissement_formateur_uai: { $ne: data.uai, $exists: true },
        cfd: cfdWithContinuum,
      })
        .then((stream) => toArray(stream))
        // Retirer ceux qui ont de la donnée au niveau formateur
        .then(async (uaisWithGestionnaire) => {
          const results = [];
          // Ensemble des formateurs associé à ce gestionnaire
          const resultsFormateur = [data.uai];
          const resultsLieux = [...data.uai_lieu_formation];

          for (const uaiWithGestionnaire of uaisWithGestionnaire) {
            resultsFormateur.push(uaiWithGestionnaire.etablissement_formateur_uai);
            resultsLieux.push(uaiWithGestionnaire.uai_formation);
            const hasData = await FormationStatsRepository.first({
              code_certification: data.code_certification,
              uai: uaiWithGestionnaire.etablissement_formateur_uai,
              uai_type: "formateur",
              millesime,
              filiere: data.filiere,
            });

            if (!hasData) {
              // Vérifier aussi si tous les lieux de ce formateur ont des données
              // Si c'est le cas, on considère que ce formateur a des données
              const lieuxDuFormateur = await CAFormationRepository.find({
                etablissement_formateur_uai: uaiWithGestionnaire.etablissement_formateur_uai,
                cfd: cfdWithContinuum,
              }).then((stream) => toArray(stream));

              const tousLieuxOntDonnees = await Promise.all(
                lieuxDuFormateur
                  .filter((lieu) => !!lieu.uai_formation)
                  .map((lieu) =>
                    FormationStatsRepository.first({
                      uai: lieu.uai_formation,
                      code_certification: data.code_certification,
                      millesime,
                      filiere: data.filiere,
                    })
                  )
              ).then((results) => results.every((r) => r !== null));

              if (!tousLieuxOntDonnees) {
                results.push(uaiWithGestionnaire);
              }
            }
          }

          return { results, resultsFormateur, resultsLieux };
        });
      return { data, cfdWithContinuum, uaisWithGestionnaire: uaisWithGestionnaire };
    }),
    filterData(({ uaisWithGestionnaire }) => uaisWithGestionnaire.results.length > 0),
    writeData(async ({ data, uaisWithGestionnaire, cfdWithContinuum }) => {
      try {
        // On a au moin un autre formateur sans donnée, on associe donc cette donnée avec un type gestionnaire
        const res = await FormationStatsRepository.updateOne(
          {
            uai: data.uai,
            millesime: data.millesime,
            code_certification: data.code_certification,
            filiere: data.filiere,
          },
          {
            uai_donnee_type: "gestionnaire",
            uai_type: "gestionnaire",
            uai_formateur: uniq(uaisWithGestionnaire.resultsFormateur.filter((u) => !!u)),
            uai_lieu_formation: uniq(uaisWithGestionnaire.resultsLieux.filter((u) => !!u)),
          }
        );

        if (res.modifiedCount) {
          logger.info(`Type de l'UAI mise à jour (formateur vers gestionnaire)`, {
            uai: data.uai,
            code_certification: data.code_certification,
            cfdWithContinuum,
          });
          result.formateur_to_gestionnaire++;
        } else {
          logger.trace(`Type de l'UAI (formateur vers gestionnaire) déjà à jour`, {
            uai: data.uai,
            code_certification: data.code_certification,
            cfdWithContinuum,
          });
        }
      } catch (err) {
        handleError(err, data);
      }
    })
  );
}

async function computeUAILieuFormationForFormateur(millesime, result, handleError) {
  return oleoduc(
    await FormationStatsRepository.find({
      filiere: "apprentissage",
      millesime,
      uai_type: { $eq: "formateur" },
    }),
    transformData(async (stats) => {
      const { uai_lieu_formation, uai_gestionnaire, millesime, code_formation_diplome, uai } = stats;

      if (!uai_lieu_formation || uai_lieu_formation.length === 0) {
        return [];
      }

      const cfdWithContinuum = await BCNRepository.cfdsParentAndChildren(code_formation_diplome);

      const lieuFormationToAdd = await Promise.all(
        uai_lieu_formation
          .filter((uai_lieu) => uai_lieu !== uai)
          .map(async (uai_lieu) => {
            const alreadyExist = await FormationStatsRepository.first({
              uai: uai_lieu,
              millesime,
              code_certification: stats.code_certification,
              filiere: stats.filiere,
            });

            // N'écrase pas les données qui existent déjà pour un couple UAI/Code de certification
            if (alreadyExist) {
              return null;
            }

            // Verifie que le lieu de formation n'a pas plusieurs formateurs dans le CA
            const notUniqFormateur = await CAFormationRepository.first({
              etablissement_formateur_uai: { $ne: uai },
              uai_formation: { $eq: uai_lieu },
              cfd: cfdWithContinuum,
            });

            if (notUniqFormateur) {
              return null;
            }

            return uai_lieu;
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
            uai_formateur: [stats.uai],
            uai_gestionnaire: uai_gestionnaire,
          };
        });
    }),
    flattenArray(),
    writeData(insertUai(result, handleError))
  );
}

async function computeUAILieuFormationForGestionnaire(millesime, result, handleError) {
  return oleoduc(
    await FormationStatsRepository.find({
      filiere: "apprentissage",
      millesime,
      uai_type: { $eq: "gestionnaire" },
    }),
    transformData(async (stats) => {
      const { uai_lieu_formation, millesime, code_formation_diplome, uai } = stats;

      if (!uai_lieu_formation || uai_lieu_formation.length === 0) {
        return [];
      }

      const cfdWithContinuum = await BCNRepository.cfdsParentAndChildren(code_formation_diplome);

      const lieuFormationToAdd = await Promise.all(
        uai_lieu_formation
          .filter((uai_lieu) => uai_lieu !== uai)
          .map(async (uai_lieu) => {
            const alreadyExist = await FormationStatsRepository.first({
              uai: uai_lieu,
              millesime,
              code_certification: stats.code_certification,
              filiere: stats.filiere,
            });

            // N'écrase pas les données qui existent déjà pour un couple UAI/Code de certification
            if (alreadyExist) {
              return null;
            }

            // Verifie que le lieu de formation n'a pas plusieurs gestionnaires dans le CA
            const notUniqGestionnaire = await CAFormationRepository.first({
              etablissement_gestionnaire_uai: { $ne: uai },
              uai_formation: { $eq: uai_lieu },
              cfd: cfdWithContinuum,
            });

            if (notUniqGestionnaire) {
              return null;
            }

            // Récupère les formateurs pour ce lieu de formation
            const uaisFormateur = await CAFormationRepository.find({
              etablissement_gestionnaire_uai: { $eq: uai },
              uai_formation: { $eq: uai_lieu },
              cfd: cfdWithContinuum,
            })
              .then((stream) => toArray(stream))
              .then((arr) => arr.map((d) => d.etablissement_formateur_uai).filter((uai) => !!uai));

            return { uai_lieu: uai_lieu, uais_formateur: uaisFormateur };
          })
      );

      return lieuFormationToAdd
        .filter((l) => l)
        .map(({ uai_lieu, uais_formateur }) => {
          return {
            ...omit(stats, ["_id", "_meta", "uai_lieu_formation"]),
            uai: uai_lieu,
            uai_type: "lieu_formation",
            ...mapKeys(omit(stats._meta, ["created_on", "date_import", "updated_on"]), (value, key) => `_meta.${key}`),
            uai_formateur: uais_formateur,
            uai_gestionnaire: [stats.uai],
          };
        });
    }),
    flattenArray(),
    writeData(insertUai(result, handleError))
  );
}

export async function computeUAI(options = {}) {
  const result = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
    lieu_formation_to_formateur: 0,
    formateur_to_gestionnaire: 0,
  };

  function handleError(e, context = {}) {
    logger.error({ err: e, ...context }, `Impossible d'associer les UAIs pour cette formation`);
    result.failed++;
    return null;
  }

  const millesimes = options.millesime
    ? [`${options.millesime - 1}_${options.millesime}`]
    : uniq([...config.millesimes.formations, ...config.millesimes.formationsSup]);

  for (const millesimeDouble of millesimes) {
    logger.info(`Traitement du millésime ${millesimeDouble}`);

    await computeUAIBase(millesimeDouble, result, handleError);
    await computeUaiFormateur(millesimeDouble, result, handleError);
    await computeUaiGestionnaire(millesimeDouble, result, handleError);
    await computeUAILieuFormationForFormateur(millesimeDouble, result, handleError);
    await computeUAILieuFormationForGestionnaire(millesimeDouble, result, handleError);
  }

  return result;
}
