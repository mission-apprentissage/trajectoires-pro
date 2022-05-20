import { compose, mergeStreams, writeData, oleoduc, transformData, flattenArray } from "oleoduc";
import { Readable } from "stream";
import bunyan from "../common/logger.js";
import { getFromStorage } from "../common/utils/ovhUtils.js";
import { parseCsv } from "../common/utils/csvUtils.js";
import { dbCollection } from "../common/mongodb.js";
import { isUAIValid } from "../common/utils/validationUtils.js";
import { InserJeunes } from "../common/InserJeunes.js";

const logger = bunyan.child({ context: "import" });

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

export async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = options.inserjeunes || new InserJeunes();
  const millesimes = options.millesimes || ["2018_2019", "2019_2020"];

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats pour la formation`);
    jobStats.failed++;
    return null;
  }

  const uais = await loadUaisFromCSV(options.input);
  const params = uais.flatMap((uai) => millesimes.map((millesime) => ({ uai, millesime })));
  logger.info(`Import des stats pour ${params.length} formations et ${uais.length} établissements`);

  await oleoduc(
    Readable.from(params),
    transformData(
      async (params) => {
        return ij.getFormationsStats(params.uai, params.millesime).catch((e) => handleError(e, params));
      },
      { parallel: 10 }
    ),
    flattenArray(),
    writeData(
      async (stats) => {
        const uai = stats.uai;
        const query = { uai: uai, code_formation: stats.code_formation, millesime: stats.millesime };

        try {
          const res = await dbCollection("formationsStats").updateOne(
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
            logger.info("Nouvelle formation ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Formation mise à jour", query);
          } else {
            logger.trace("Formation déjà à jour", query);
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
