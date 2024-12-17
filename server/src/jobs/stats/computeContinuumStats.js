import { oleoduc, transformData, flattenArray, filterData, writeData, mergeStreams, compose } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { omit, get } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { certificationsStats, regionalesStats, formationsStats } from "#src/common/db/collections/collections.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import { getCertificationInfo } from "#src/common/certification.js";

const logger = getLoggerWithContext("import");

const statCollections = {
  formations: {
    collection: () => formationsStats(),
    repository: () => FormationStatsRepository,
    keys: ["code_certification", "uai"],
  },
  certifications: {
    collection: () => certificationsStats(),
    repository: () => CertificationStatsRepository,
    keys: ["code_certification"],
  },
  regionales: {
    collection: () => regionalesStats(),
    repository: () => RegionaleStatsRepository,
    keys: ["code_certification", "region.code"],
  },
};

function streamStats(statName) {
  return compose(
    // Pas de continuum pour les données du supérieur
    getCollectionForStats(statName)
      .find({
        filiere: { $ne: "superieur" },
      })
      .sort({ code_certification: 1 })
      .stream(),
    transformData((data) => ({
      data,
      statName,
    }))
  );
}

function getQueryForStats({ data, statName, millesime }) {
  return {
    ...statCollections[statName].keys.reduce(
      (acc, key) => ({
        ...acc,
        [key]: get(data, key),
      }),
      {}
    ),
    millesime: millesime,
  };
}

function getCollectionForStats(statName) {
  return statCollections[statName].collection();
}

function getRepositoryForStats(statName) {
  return statCollections[statName].repository();
}

async function getMostRecentStatsFromDiplomeGraph({ childrenGraph, initData, query, statName }) {
  let prevStats = initData;
  for (const child of childrenGraph) {
    // only support 1 <=> 1 relationship for now
    if (child.length !== 1 || child[0].ancien_diplome.length !== 1) {
      return prevStats;
    }
    const stats = await getRepositoryForStats(statName).first({
      ...query,
      code_certification: child[0].code_certification,
      "donnee_source.type": "self",
    });
    prevStats = stats || prevStats;
  }

  return prevStats;
}

async function buildDataContinuum({ type, code_certification, oldData, oldQuery, statName, diplomeBCN }) {
  const certification = await getCertificationInfo(code_certification);

  return {
    diplomeBCN: diplomeBCN,
    statName,
    query: {
      ...oldQuery,
      code_certification: code_certification,
    },
    data: {
      ...omit(oldData, [
        "_id",
        "_meta",
        "code_certification",
        "code_formation_diplome",
        "diplome",
        "libelle",
        "libelle_ancien",
        "donnee_source",
        "date_fermeture",
      ]),
      ...certification,
      donnee_source: {
        code_certification: oldData.code_certification,
        type,
      },
    },
  };
}

async function computeParents({ diplomeBCN, data, query, statName }) {
  const parents = diplomeBCN.ancien_diplome;
  // Support only 1 to 1 case
  if (parents.length !== 1) {
    return [];
  }

  const parent_code_certification = parents[0];
  // Check if children of parent length is 1
  const diplomeParentBCN = await BCNRepository.first({ code_certification: parent_code_certification });
  if (diplomeParentBCN.nouveau_diplome.length !== 1) {
    return [];
  }

  // Check if parent data already exist
  const exist = await getRepositoryForStats(statName).first({
    ...query,
    code_certification: parent_code_certification,
    "donnee_source.type": "self",
  });
  if (exist) {
    return [];
  }

  const childrenGraph = await BCNRepository.diplomeChildrenGraph({ code_certification: data.code_certification });
  const mostRecentData = await getMostRecentStatsFromDiplomeGraph({ childrenGraph, initData: data, query, statName });
  if (!mostRecentData) {
    return [];
  }

  const dataParent = await buildDataContinuum({
    type: "nouvelle",
    code_certification: parent_code_certification,
    oldData: mostRecentData,
    oldQuery: query,
    statName,
    diplomeBCN: diplomeParentBCN,
  });

  return [dataParent, ...(await computeParents(dataParent))];
}

async function computeChildren({ diplomeBCN, data, query, statName }) {
  const children = diplomeBCN.nouveau_diplome;

  // Support only 1 to 1 case
  if (children.length !== 1) {
    return [];
  }

  // Check if children already exist and if parent children length is 1
  const child_code_certification = children[0];
  const diplomeChildrenBCN = await BCNRepository.first({ code_certification: child_code_certification });
  if (diplomeChildrenBCN.ancien_diplome.length !== 1) {
    return [];
  }

  const existSelf = await getRepositoryForStats(statName).first({
    ...query,
    code_certification: child_code_certification,
    "donnee_source.type": "self",
  });
  const existNew = await getRepositoryForStats(statName).first({
    ...query,
    code_certification: child_code_certification,
    "donnee_source.type": "nouvelle",
  });
  if (existSelf || existNew) {
    return [];
  }

  const dataChildren = await buildDataContinuum({
    type: "ancienne",
    code_certification: child_code_certification,
    oldData: data,
    oldQuery: query,
    statName,
    diplomeBCN: diplomeChildrenBCN,
  });

  return [dataChildren, ...(await computeChildren(dataChildren))];
}

export async function computeContinuumStats(options = {}) {
  let stats = options.stats || ["certifications", "regionales", "formations"];
  const result = { total: 0, created: 0, updated: 0, failed: 0 };

  const millesime = options.millesime || null;

  function handleError(e, context = {}) {
    logger.error({ err: e, ...context }, `Impossible de calculer les données pour les anciens/nouveaux diplomes`);
    result.failed++;
    return null;
  }

  await oleoduc(
    mergeStreams(stats.map(streamStats)),
    filterData(({ data }) => data?.donnee_source?.type === "self" && (!millesime || data.millesime === millesime)),
    transformData(async ({ data, statName }) => {
      const query = { ...getQueryForStats({ data, statName, millesime: data.millesime }) };

      try {
        const diplomeBCN = await BCNRepository.first({ code_certification: data.code_certification });
        const children = await computeChildren({ diplomeBCN, data, query, statName });
        const parents = await computeParents({ diplomeBCN, data, query, statName });
        return [...children, ...parents];
      } catch (err) {
        result.total++;
        handleError(err, query);

        return [];
      }
    }),
    flattenArray(),
    writeData(async ({ statName, query, data }) => {
      result.total++;
      try {
        const res = await upsert(getCollectionForStats(statName), query, {
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
          logger.info("Stats pour les anciens/nouveaux diplomes ajoutées", query);
          result.created++;
        } else if (res.modifiedCount) {
          result.updated++;
          logger.info("Stats pour les anciens/nouveaux diplomes mises à jour", query);
        } else {
          logger.trace("Stats pour anciens/nouveaux diplomes déjà à jour", query);
        }
      } catch (e) {
        handleError(e, query);
      }
    })
  );

  return result;
}
