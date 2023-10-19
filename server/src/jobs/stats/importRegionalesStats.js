import { Readable } from "stream";
import { omit, pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { InserJeunes } from "#src/services/inserjeunes/InserJeunes.js";
import { flattenArray, oleoduc, transformData, writeData, filterData } from "oleoduc";
import { regionalesStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { computeCustomStats, getMillesimesRegionales, INSERJEUNES_IGNORED_STATS_NAMES } from "#src/common/stats.js";
import { getCertificationInfo } from "#src/common/certification.js";
import { getRegions, findRegionByCodeRegionAcademique } from "#src/services/regions.js";

const logger = getLoggerWithContext("import");

export async function importRegionalesStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  // Set a default retry for the InserJeunes API
  const inserjeunesOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.inserjeunesOptions || {});
  const ij = options.inserjeunes || new InserJeunes(inserjeunesOptions);

  const millesimes = options.millesimes || getMillesimesRegionales();
  const codes_region_academique =
    options.codes_region_academique || getRegions().map(({ code_region_academique }) => code_region_academique);

  function handleError(e, context = {}) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats pour la certification`);
    jobStats.failed++;
    return null;
  }

  let params = millesimes.flatMap((millesime) => {
    // Ignore les codes région académique 00 et 13 (Non géré par IJ)
    return codes_region_academique
      .filter((code) => !["00", "13"].includes(code))
      .map((code_region_academique) => {
        const region = findRegionByCodeRegionAcademique(code_region_academique);

        if (!region) {
          throw new Error(`Code région académique ${code_region_academique} inconnu`);
        }

        return {
          millesime,
          region,
        };
      });
  });

  await oleoduc(
    Readable.from(params),
    transformData(
      async (params) => {
        return ij
          .getRegionalesStats(params.millesime, params.region.code_region_academique)
          .then((array) => array.map((stats) => ({ stats, params })))
          .catch((e) => handleError(e, params));
      },
      { parallel: 4 }
    ),
    flattenArray(),
    //Filtre la filiere agricole (non gérer actuellement)
    filterData(({ stats: { filiere } }) => filiere !== "agricole"),
    writeData(
      async ({ params: { region }, stats: regionaleStats }) => {
        const query = {
          millesime: regionaleStats.millesime,
          code_certification: regionaleStats.code_certification,
          filiere: regionaleStats.filiere,
          "region.code": region.code,
        };

        try {
          const certification = await getCertificationInfo(regionaleStats.code_certification);
          const stats = omit(regionaleStats, INSERJEUNES_IGNORED_STATS_NAMES);
          const customStats = computeCustomStats(regionaleStats);

          // Delete data compute with continuum job (= when type is not self)
          await regionalesStats().deleteOne({
            ...query,
            "donnee_source.type": { $ne: "self" },
          });

          const res = await upsert(regionalesStats(), query, {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil({
              ...stats,
              ...customStats,
              ...certification,
              region: pick(region, ["code", "nom", "code_region_academique"]),
              donnee_source: {
                code_certification: regionaleStats.code_certification,
                type: "self",
              },
              "_meta.inserjeunes": pick(regionaleStats, INSERJEUNES_IGNORED_STATS_NAMES),
            }),
          });

          if (res.upsertedCount) {
            logger.info("Nouvelle stats regionale ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats regionale mise à jour", query);
          } else {
            logger.trace("Stats regionale déjà à jour", query);
          }
        } catch (e) {
          handleError(e, query);
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}
