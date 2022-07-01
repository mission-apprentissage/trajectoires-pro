import { Readable } from "stream";
import { InserJeunes } from "../common/InserJeunes.js";
import { flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import { bcn, certificationsStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";

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
          const certification = await bcn().findOne({ code_certification: stats.code_certification });

          const res = await certificationsStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...stats,
                diplome: certification?.diplome,
              }),
            },
            { upsert: true }
          );

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
