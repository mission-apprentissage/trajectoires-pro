import { Readable } from "stream";
import { InserJeunes } from "../common/InserJeunes.js";
import { flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import { getCFD } from "../common/actions/getCFD.js";
import { certificationsStats } from "../common/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";

const logger = getLoggerWithContext("import");

export async function importCertificationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = options.inserjeunes || new InserJeunes();
  const millesimes = options.millesimes || ["2019", "2020"];
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
      async (stats) => {
        const query = { millesime: stats.millesime, code_certification: stats.code_certification };

        try {
          const cfd = await getCFD(stats.code_certification);

          const diplome = cfd?.diplome;
          if (!diplome) {
            logger.warn(`Impossible de trouver le diplome pour la stats`, query);
          }

          const res = await certificationsStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: {
                ...stats,
                ...(diplome ? { diplome } : {}),
              },
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info("Nouvelle stats de certification ajout??e", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats de certification mise ?? jour", query);
          } else {
            logger.trace("Stats de certification d??j?? ?? jour", query);
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
