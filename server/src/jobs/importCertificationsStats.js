import { Readable } from "stream";
import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import { upsert } from "../common/db/mongodb.js";
import { bcn, certificationsStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { computeCustomStats, getMillesimes, INSERJEUNES_IGNORED_STATS_NAMES } from "../common/stats.js";
import { omit, pick, merge } from "lodash-es";

const logger = getLoggerWithContext("import");

export async function importCertificationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  // Set a default retry for the InserJeunes API
  const inserjeunesOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.inserjeunesOptions || {});
  const ij = options.inserjeunes || new InserJeunes(inserjeunesOptions);
  const millesimes = options.millesimes || getMillesimes();
  const filieres = options.filieres || ["apprentissage", "voie_pro_sco_educ_nat"];

  function handleError(e, context = {}) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats pour la certification`);
    jobStats.failed++;
    return null;
  }

  let params = millesimes.flatMap((millesime) => {
    return filieres.map((filiere) => ({ millesime, filiere }));
  });

  await oleoduc(
    Readable.from(params),
    transformData(
      async (params) => {
        return ij.getCertificationsStats(params.millesime, params.filiere).catch((e) => handleError(e, params));
      },
      { parallel: 4 }
    ),
    flattenArray(),
    writeData(
      async (certificationStats) => {
        const query = {
          millesime: certificationStats.millesime,
          code_certification: certificationStats.code_certification,
        };

        try {
          const certification = await bcn().findOne({ code_certification: certificationStats.code_certification });
          const stats = omit(certificationStats, INSERJEUNES_IGNORED_STATS_NAMES);
          const customStats = computeCustomStats(certificationStats);

          const res = await upsert(certificationsStats(), query, {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil({
              ...stats,
              ...customStats,
              code_formation_diplome: certification?.code_formation_diplome,
              diplome: certification?.diplome,
              "_meta.inserjeunes": pick(certificationStats, INSERJEUNES_IGNORED_STATS_NAMES),
            }),
          });

          if (res.upsertedCount) {
            logger.info("Nouvelle stats de certification ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats de certification mise à jour", query);
          } else {
            logger.trace("Stats de certification déjà à jour", query);
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
