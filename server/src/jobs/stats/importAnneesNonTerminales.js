import { Readable } from "stream";
import { flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import streamToArray from "stream-to-array";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getMillesimes, getMillesimesFormations, getMillesimesRegionales } from "#src/common/stats.js";
import { getCertificationInfo } from "#src/common/certification.js";
import { get, pick } from "lodash-es";
import { certificationsStats, regionalesStats, formationsStats } from "#src/common/db/collections/collections.js";
import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import BCNMefRepository from "#src/common/repositories/bcnMef.js";

const logger = getLoggerWithContext("import");

const statCollections = {
  formations: {
    collection: () => formationsStats(),
    repository: () => FormationStatsRepository,
    millesimes: getMillesimesFormations,
    baseData: (stats) => pick(stats, ["filiere", "uai", "region", "academie"]),
    keys: ["uai"],
  },
  certifications: {
    collection: () => certificationsStats(),
    repository: () => CertificationStatsRepository,
    millesimes: getMillesimes,
    baseData: (stats) => pick(stats, ["filiere"]),
    keys: [],
  },
  regionales: {
    collection: () => regionalesStats(),
    repository: () => RegionaleStatsRepository,
    millesimes: getMillesimesRegionales,
    baseData: (stats) => pick(stats, ["filiere", "region"]),
    keys: ["region.code"],
  },
};

async function getCertificationForYear(year, { code_certification, code_formation_diplome }) {
  const previousMef = code_certification.substr(0, 3) + year + code_certification.substr(3 + 1);
  const certification = await getCertificationInfo(previousMef);

  if (certification) {
    return certification;
  }

  const certificationsFromMef = await streamToArray(
    await BCNMefRepository.find({
      formation_diplome: code_formation_diplome,
      annee_dispositif: `${year}`,
    })
  );

  if (certificationsFromMef.length === 1) {
    return await getCertificationInfo(certificationsFromMef[0].mef_stat_11);
  }

  return null;
}

export async function importAnneesNonTerminales(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const statsType = options.stats || ["certifications", "formations", "regionales"];
  const millesimesFilter = options.millesimes || null;

  await oleoduc(
    Readable.from(statsType),
    flattenArray(),
    transformData((statType) => {
      const millesimes = millesimesFilter ? millesimesFilter : statCollections[statType].millesimes();
      return millesimes.map((millesime) => ({
        statType,
        millesime,
      }));
    }),
    flattenArray(),
    writeData(async (data) => {
      const { statType, millesime } = data;
      await oleoduc(
        await statCollections[data.statType].repository().find({
          filiere: "pro",
          millesime: millesime,
          "donnee_source.type": { $exists: true },
        }),
        transformData(async (stats) => {
          const previousYearStats = [];
          for (let year = stats.code_certification[3] - 1; year > 0; year--) {
            const previousCertification = await getCertificationForYear(
              year,
              pick(stats, ["code_formation_diplome", "code_certification"])
            );
            if (previousCertification) {
              previousYearStats.push({
                stats,
                certification: previousCertification,
                code_certification: previousCertification.code_certification,
              });
            }
          }
          return previousYearStats;
        }),
        flattenArray(),
        writeData(async ({ code_certification, certification, stats }) => {
          const query = {
            millesime: stats.millesime,
            code_certification: code_certification,
            ...statCollections[statType].keys.reduce((acc, key) => {
              acc[key] = get(stats, key);
              return acc;
            }, {}),
          };

          try {
            if (!certification) {
              logger.error(`Certification ${code_certification} pour ${stats.code_formation_diplome} inconnue.`);
              jobStats.failed++;
              return;
            }

            const res = await upsert(statCollections[statType].collection(), query, {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                millesime: stats.millesime,
                code_certification,
                ...certification,
                ...statCollections[statType].baseData(stats),
                certificationsTerminales: [pick(stats, ["code_certification"])],
              }),
            });

            if (res.upsertedCount) {
              logger.info(`Nouvelle année pour la formation ${statType}/${code_certification} ajoutée`, query);
              jobStats.created++;
            } else if (res.modifiedCount) {
              jobStats.updated++;
              logger.debug(`Nouvelle année pour la formation ${statType}/${code_certification} mise à jour`, query);
            } else {
              logger.trace(`Nouvelle année pour la formation ${statType}/${code_certification} déjà à jour`, query);
            }
          } catch (e) {
            logger.error(
              { err: e, query },
              `Impossible d'importer une nouvelle année pour la formation ${statType}/${code_certification}`
            );
            jobStats.failed++;
          }
        })
      );
    })
  );

  return jobStats;
}
