import { Readable } from "stream";
import streamToArray from "stream-to-array";
import { filterData, flattenArray, oleoduc, transformData, writeData, compose } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getMillesimes, getMillesimesFormations, getMillesimesRegionales } from "#src/common/stats.js";
import { getCertificationInfo } from "#src/common/certification.js";
import { omit, pick } from "lodash-es";
import { certificationsStats, regionalesStats, formationsStats } from "#src/common/db/collections/collections.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import CertificationStatsRepository from "#src/common/repositories/certificationStats.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import * as BCN from "#src/services/bcn/bcn.js";
import { BCNApi } from "#src/services/bcn/BCNApi.js";
import { REGIONS } from "#src/services/regions.js";

const logger = getLoggerWithContext("import");

const statCollections = {
  formations: {
    collection: () => formationsStats(),
    repository: () => FormationStatsRepository,
    millesimes: getMillesimesFormations,
    group: async (data) => {
      return compose(
        await FormationStatsRepository.findUniqueUAI(data.millesime),
        transformData((uaiData) => {
          return {
            ...data,
            keys: {
              uai: uaiData.uai,
            },
            baseData: omit(uaiData, "_id"),
          };
        })
      );
    },
  },
  certifications: {
    collection: () => certificationsStats(),
    repository: () => CertificationStatsRepository,
    millesimes: getMillesimes,
    group: async (data) => Readable.from([{ ...data, keys: {}, baseData: {} }]),
  },
  regionales: {
    collection: () => regionalesStats(),
    repository: () => RegionaleStatsRepository,
    millesimes: getMillesimesRegionales,
    group: async (data) => {
      return Readable.from(
        REGIONS.map((region) => {
          return {
            ...data,
            keys: {
              "region.code": region.code,
            },
            baseData: {
              region: pick(region, ["code", "code_region_academique", "nom"]),
            },
          };
        })
      );
    },
  },
};

async function importSecondeCommuneFor(jobStats, { statType, formations, familleMetier, millesime, keys, baseData }) {
  await oleoduc(
    await BCNRepository.find({
      "familleMetier.code": familleMetier["code"],
      "familleMetier.isAnneeCommune": true,
    }),
    writeData(async (secondeCommune) => {
      const query = {
        millesime: millesime,
        code_certification: secondeCommune.code_certification,
        filiere: formations[0].filiere,
        ...keys,
      };

      try {
        const certification = await getCertificationInfo(secondeCommune.code_certification);
        const res = await upsert(statCollections[statType].collection(), query, {
          $setOnInsert: {
            "_meta.date_import": new Date(),
            "_meta.created_on": new Date(),
            "_meta.updated_on": new Date(),
          },
          $set: omitNil({
            millesime,
            filiere: formations[0].filiere, // Les secondes communes existent uniquement en voie scolaire
            ...certification,
            certificationsTerminales: formations.map((f) => pick(f, ["code_certification"])),
            ...baseData,
          }),
        });

        if (res.upsertedCount) {
          logger.info(`Nouvelle seconde commune ${statType}/${secondeCommune.code_certification} ajoutée`, query);
          jobStats.created++;
        } else if (res.modifiedCount) {
          jobStats.updated++;
          logger.debug(`Seconde commune ${statType}/${secondeCommune.code_certification} mise à jour`, query);
        } else {
          logger.trace(`Seconde commune ${statType}/${secondeCommune.code_certification} déjà à jour`, query);
        }
      } catch (e) {
        logger.error(
          { err: e, query },
          `Impossible d'importer les stats pour la seconde commune ${statType}/${secondeCommune.code_certification}`
        );
        jobStats.failed++;
      }
    })
  );

  return jobStats;
}

export async function importSecondeCommune(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const statsType = options.stats || ["certifications", "formations", "regionales"];
  const millesimes = options.millesimes || null;
  const millesimesDouble = millesimes ? millesimes.map((m) => `${m - 1}_${m}`) : null;
  const millesimesFilter = millesimes ? [...millesimes, ...millesimesDouble] : null;
  const bcnApi = new BCNApi();
  const famillesMetier = await BCN.getFamilleMetier(bcnApi);

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
    transformData(({ statType, millesime }) => {
      return famillesMetier.map((familleMetier) => ({
        familleMetier,
        statType,
        millesime,
      }));
    }),
    flattenArray(),
    writeData(async (data) => {
      await oleoduc(
        await statCollections[data.statType].group(data),
        transformData(async ({ statType, familleMetier, millesime, keys, baseData }) => {
          // Get famille de métier with stats
          const formations = await streamToArray(
            await statCollections[statType].repository().find({
              "donnee_source.type": "self",
              filiere: ["pro", "agricole"],
              millesime,
              "familleMetier.code": familleMetier["code"],
              ...keys,
            })
          );

          return {
            statType,
            millesime,
            formations,
            familleMetier,
            keys,
            baseData,
          };
        }),
        filterData(({ formations }) => formations.length > 0),
        transformData((data) => {
          // Sépare les formations scolaires et agricoles
          const pro = data.formations.filter((f) => f.filiere === "pro");
          const agricole = data.formations.filter((f) => f.filiere === "agricole");
          return [
            ...(pro.length ? [{ ...data, formations: pro }] : []),
            ...(agricole.length ? [{ ...data, formations: agricole }] : []),
          ];
        }),
        flattenArray(),
        writeData(async (data) => {
          await importSecondeCommuneFor(jobStats, data);
        })
      );
    })
  );

  return jobStats;
}
