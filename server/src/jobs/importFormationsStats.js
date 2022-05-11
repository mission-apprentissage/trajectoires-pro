const { getFromStorage } = require("../common/utils/ovhUtils");
const logger = require("../common/logger").child({ context: "import" });
const { compose, mergeStreams, writeData, oleoduc, transformData, flattenStream } = require("oleoduc");
const { Readable } = require("stream");
const { parseCsv } = require("../common/utils/csvUtils");
const { dbCollection } = require("../common/mongodb");
const { isUAIValid } = require("../common/utils/validationUtils");
const InserJeunes = require("../common/InserJeunes");

function readCSV(stream) {
  return compose(stream, parseCsv());
}

async function getDefaultCSV() {
  return compose(
    mergeStreams([
      readCSV(await getFromStorage("depp-2022-etablissement-voie-pro-sco-2020-2019-maj2-112307.csv")),
      readCSV(await getFromStorage("depp-2022-etablissement-apprentissage-2020-2019-maj2-112304.csv")),
    ]),
    transformData((line) => {
      return {
        uai: line["n°UAI de l'établissement"],
      };
    })
  );
}

async function loadUaisFromCSV(input) {
  const uais = new Set();
  const stream = input ? readCSV(input) : await getDefaultCSV();

  await oleoduc(
    stream,
    writeData((line) => {
      const uai = line.uai;
      if (isUAIValid(uai)) {
        uais.add(uai);
      } else {
        logger.warn(`UAI invalide détecté ${uai}`);
      }
    })
  );

  return [...uais];
}

async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = new InserJeunes();
  const millesimes = options.millesimes || ["2018_2019", "2019_2020"];

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats pour l'établissement`);
    jobStats.failed++;
  }

  const uais = await loadUaisFromCSV(options.input);
  logger.info(`Import des stats pour ${uais.length} établissements`);

  await oleoduc(
    Readable.from(uais.flatMap((uai) => millesimes.map((millesime) => ({ uai, millesime })))),
    transformData(
      async ({ uai, millesime }) => {
        return ij.getFormationsStats(uai, millesime).catch((e) => {
          handleError(e, { uai, millesime });
          return null;
        });
      },
      { parallel: 10 }
    ),
    flattenStream(),
    writeData(
      async (stats) => {
        const uai = stats.uai;

        try {
          let query = { uai: uai, code_formation: stats.code_formation };
          const res = await dbCollection("formationsStats").updateOne(
            query,
            {
              $set: stats,
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info("Nouvelle formation ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Formation mise à jour", query);
          } else {
            logger.trace("Formation déjà à jour", query);
          }
        } catch (e) {
          handleError(e, { uai });
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}

module.exports = importFormationsStats;
