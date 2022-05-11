const logger = require("../common/logger").child({ context: "import" });
const { writeData, oleoduc, transformData, flattenStream } = require("oleoduc");
const { Readable } = require("stream");
const { dbCollection } = require("../common/mongodb");
const InserJeunes = require("../common/InserJeunes");

async function importCertificationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = options.inserjeunes || new InserJeunes();
  const millesimes = options.millesimes || ["2019", "2020"];
  const filieres = options.filieres || ["apprentissage", "voie_pro_sco_educ_nat"];

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats pour la certification`);
    jobStats.failed++;
  }

  let params = millesimes.flatMap((millesime) => {
    return filieres.map((filiere) => ({ millesime, filiere }));
  });

  await oleoduc(
    Readable.from(params),
    transformData(
      async ({ millesime, filiere }) => {
        return ij.getCertificationsStats(millesime, filiere).catch((e) => {
          handleError(e, { millesime, filiere });
          return null;
        });
      },
      { parallel: 10 }
    ),
    flattenStream(),
    writeData(
      async (stats) => {
        const query = { millesime: stats.millesime, code_formation: stats.code_formation };

        try {
          const res = await dbCollection("certificationsStats").updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: stats,
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info("Nouvelle certification ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Certification mise à jour", query);
          } else {
            logger.trace("Certification déjà à jour", query);
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

module.exports = importCertificationsStats;
