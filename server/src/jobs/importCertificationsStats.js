import bunyan from "../common/logger.js";
import { Readable } from "stream";
import { InserJeunes } from "../common/InserJeunes.js";
import { flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import { certifications, certificationsStats } from "../common/collections/index.js";
import { pick } from "lodash-es";

const logger = bunyan.child({ context: "import" });

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
        const query = { millesime: stats.millesime, code_formation: stats.code_formation };

        try {
          const certification = await certifications().findOne({
            $or: [{ code_formation: stats.code_formation }, { "alias.code": stats.code_formation }],
          });

          if (!certification) {
            logger.warn(`Impossible de trouver la certification pour la stats`, query);
          }

          const res = await certificationsStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: {
                ...stats,
                ...(certification
                  ? { certification: pick(certification, ["code_formation", "diplome", "alias"]) }
                  : {}),
              },
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
