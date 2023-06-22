import { Readable } from "stream";
import { omit, pick } from "lodash-es";
import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { flattenArray, oleoduc, transformData, writeData, filterData } from "oleoduc";
import { bcn, regionalesStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { computeCustomStats, getMillesimesRegionales, INSERJEUNES_IGNORED_STATS_NAMES } from "../common/stats.js";
import { getRegions, findRegionByCodeRegionAcademique } from "../common/regions.js";

const logger = getLoggerWithContext("import");

export async function importRegionalesStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = options.inserjeunes || new InserJeunes();
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
      .map((code_region_academique) => ({
        millesime,
        region: findRegionByCodeRegionAcademique(code_region_academique),
      }));
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
          const certification = await bcn().findOne({ code_certification: regionaleStats.code_certification });
          const stats = omit(regionaleStats, INSERJEUNES_IGNORED_STATS_NAMES);
          const customStats = computeCustomStats(regionaleStats);

          const res = await regionalesStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...stats,
                ...customStats,
                region: pick(region, ["code", "nom", "code_region_academique"]),
                code_formation_diplome: certification?.code_formation_diplome,
                diplome: certification?.diplome,
                "_meta.inserjeunes": pick(regionaleStats, INSERJEUNES_IGNORED_STATS_NAMES),
              }),
            },
            { upsert: true }
          );

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
