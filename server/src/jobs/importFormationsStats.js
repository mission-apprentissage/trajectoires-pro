const { getFromStorage } = require("../common/utils/ovhUtils");
const logger = require("../common/logger").child({ context: "import" });
const { compose, mergeStreams, writeData, oleoduc, transformData } = require("oleoduc");
const { Readable } = require("stream");
const { parseCsv } = require("../common/utils/csvUtils");
const { dbCollection } = require("../common/mongodb");
const { isUAIValid } = require("../common/utils/validationUtils");
const createInserJeunesApiBeautifier = require("../common/api/createInserJeunesApiBeautifier");

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
  const { getFormationsStats } = createInserJeunesApiBeautifier();
  const millesimes = options.millesimes || ["2018_2019", "2019_2020"];

  const uais = await loadUaisFromCSV(options.input);
  logger.info(`Import des stats pour ${uais.length} établissements`);

  await oleoduc(
    Readable.from(uais),
    writeData(
      async (uai) => {
        try {
          await Promise.all(
            millesimes.map(async (millesime) => {
              for await (const stats of await getFormationsStats(uai, millesime)) {
                const res = await dbCollection("formationsStats").updateOne(
                  { uai: stats.uai, code_formation: stats.code_formation },
                  {
                    $set: stats,
                  },
                  { upsert: true }
                );

                if (res.upsertedCount) {
                  logger.debug(`Nouvelle formation ajoutée ${uai}`);
                  jobStats.created++;
                } else if (res.modifiedCount) {
                  jobStats.updated++;
                  logger.debug(`Formation ${uai} mise à jour`);
                } else {
                  logger.trace(`Formation ${uai} déjà à jour`);
                }
              }
            })
          );
        } catch (e) {
          jobStats.failed++;
          logger.error(e, `Impossible d'importer les stats pour l'établissement ${uai}`);
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}

module.exports = importFormationsStats;
