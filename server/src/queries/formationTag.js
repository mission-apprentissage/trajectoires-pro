import { isNil, flatten } from "lodash-es";
import { getLastMillesimesFormations } from "#src/common/stats.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("query");

export const FORMATION_TAG = {
  inserjeunes: {
    tags: ["pour_travailler_rapidement", "pour_continuer_des_etudes"],
    create: ({ thresholdEnEmploi, thresholdEnEtude } = { thresholdEnEmploi: 31, thresholdEnEtude: 64 }) => {
      return createInserJeunesTag({ thresholdEnEmploi, thresholdEnEtude });
    },
  },
};

export function createTags() {
  return [
    {
      $set: {
        "formation.tags": [],
      },
    },
    ...flatten(
      Object.values(FORMATION_TAG)
        .map((tag) => tag.create())
        .filter((query) => query)
    ),
  ];
}

export function createInserJeunesTag(
  { thresholdEnEmploi = null, thresholdEnEtude = null } = {
    thresholdEnEmploi: null,
    thresholdEnEtude: null,
  }
) {
  // TODO : tag inserjeunes stats when we don't want to display
  const MIN_ELEVES_THRESHOLD = 20;

  if (isNil(thresholdEnEmploi) || isNil(thresholdEnEtude)) {
    logger.error("Seuil en emploi ou en étude non défini");
    return null;
  }

  return [
    {
      $lookup: {
        from: "formationsStats",
        foreignField: "uai",
        localField: "formation.uai",
        as: "inserjeunes",
        let: { voie: "$formation.voie", mef11: "$formation.mef11", cfd: "$formation.cfd" },
        pipeline: [
          {
            $match: {
              millesime: getLastMillesimesFormations(),
              nb_annee_term: { $gte: MIN_ELEVES_THRESHOLD },
              $expr: {
                $or: [
                  {
                    $and: [
                      {
                        $eq: ["$$voie", "scolaire"],
                      },
                      {
                        $eq: ["$code_certification", "$$mef11"],
                      },
                    ],
                  },
                  {
                    $and: [
                      {
                        $eq: ["$$voie", "apprentissage"],
                      },
                      {
                        $eq: ["$code_certification", "$$cfd"],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    },
    {
      $set: {
        inserjeunes: { $first: "$inserjeunes" },
      },
    },
    {
      $set: {
        "formation.tags": {
          $concatArrays: [
            "$formation.tags",
            {
              $cond: [
                {
                  $gte: ["$inserjeunes.taux_en_emploi_6_mois", thresholdEnEmploi],
                },
                ["pour_travailler_rapidement"],
                [],
              ],
            },
            {
              $cond: [
                {
                  $gte: ["$inserjeunes.taux_en_formation", thresholdEnEtude],
                },
                ["pour_continuer_des_etudes"],
                [],
              ],
            },
          ],
        },
      },
    },
  ];
}

export function filterTag(tag) {
  if (!tag) {
    return [];
  }

  const formationTag = flatten(Object.values(FORMATION_TAG).map((t) => t.tags)).includes(tag);
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
