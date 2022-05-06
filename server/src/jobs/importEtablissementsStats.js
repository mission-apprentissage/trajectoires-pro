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

async function importEtablissementsStats(options = {}) {
  const jobStats = { total: 0, created: 0, updated: 0, failed: 0 };
  const { getFormationsStats } = createInserJeunesApiBeautifier();
  const millesimes = options.millesimes || ["2018_2019", "2019_2020"];

  const uais = await loadUaisFromCSV(options.input);
  logger.info(`Import des stats pour ${uais.length} établissements`, { uais });

  await oleoduc(
    Readable.from(uais),
    writeData(
      async (uai) => {
        try {
          jobStats.total++;
          const stats = await Promise.all(millesimes.map((millesime) => getFormationsStats(uai, millesime)));

          const res = await dbCollection("etablissementsStats").updateOne(
            { uai },
            {
              $setOnInsert: {
                uai,
              },
              $set: {
                formations: stats.flatMap((a) => a),
              },
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.debug(`Nouvel établissement ajouté ${uai}`);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug(`Etablissement ${uai} mis à jour`);
          } else {
            logger.trace(`Etablissement ${uai} déjà à jour`);
          }
        } catch (e) {
          jobStats.failed++;
          logger.error(e, `Impossible d'importer les stats pour l'uai ${uai}`);
        }
      },
      { parallel: 10 }
    )
  );

  return jobStats;
}

module.exports = importEtablissementsStats;
