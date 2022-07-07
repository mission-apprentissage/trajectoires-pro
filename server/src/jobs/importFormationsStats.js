import { compose, flattenArray, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { Readable } from "stream";
import { getFromStorage } from "../common/utils/ovhUtils.js";
import { parseCsv } from "../common/utils/csvUtils.js";
import { isUAIValid } from "../common/utils/validationUtils.js";
import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { bcn, formationsStats } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { findRegionByNom } from "../common/regions.js";
import { pick } from "lodash-es";

const logger = getLoggerWithContext("import");

function readCSV(stream) {
  return compose(stream, parseCsv());
}

async function getDefaultEtablissementsCSV() {
  return compose(
    mergeStreams([
      readCSV(await getFromStorage("depp-2022-etablissement-2018-et-2019-pro.csv")),
      readCSV(await getFromStorage("depp-2022-etablissement-2019-et-2020-pro.csv")),
      readCSV(await getFromStorage("depp-2022-etablissement-2018-et-2019-apprentissage.csv")),
      readCSV(await getFromStorage("depp-2022-etablissements-2019-et-2020-apprentissage.csv")),
    ]),
    transformData((line) => {
      return {
        uai: line["n°UAI de l'établissement"],
      };
    })
  );
}

async function loadEtablissementsFromCSV(input) {
  const etablissements = [];
  const stream = input ? readCSV(input) : await getDefaultEtablissementsCSV();

  await oleoduc(
    stream,
    writeData((data) => {
      const uai = data["n°UAI de l'établissement"];
      const region = findRegionByNom(data["Région"]);
      if (isUAIValid(uai) && !etablissements.find((e) => e.uai === uai)) {
        etablissements.push({ uai, region });
      } else {
        logger.warn(`UAI invalide détecté ${uai}`);
      }
    })
  );

  return etablissements;
}

export async function importFormationsStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };
  const ij = options.inserjeunes || new InserJeunes();
  const millesimes = options.millesimes || ["2018_2019", "2019_2020"];

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats pour la formation`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  const etablissements = await loadEtablissementsFromCSV(options.etablissements);
  const params = etablissements.flatMap((etablissement) =>
    millesimes.map((millesime) => ({ etablissement, millesime }))
  );
  logger.info(
    `Import des stats pour ${params.length} formations, ${etablissements.length} établissements et ${millesimes.length} millesimes`
  );

  await oleoduc(
    Readable.from(params),
    transformData(
      ({ etablissement, millesime }) => {
        return ij
          .getFormationsStats(etablissement.uai, millesime)
          .then((array) => {
            return array.map((stats) => {
              return {
                stats,
                etablissement,
              };
            });
          })
          .catch((e) => handleError(e, params));
      },
      { parallel: 10 }
    ),
    flattenArray(),
    writeData(
      async ({ etablissement, stats }) => {
        const query = { uai: stats.uai, code_certification: stats.code_certification, millesime: stats.millesime };

        try {
          const certification = await bcn().findOne({ code_certification: stats.code_certification });

          const res = await formationsStats().updateOne(
            query,
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...stats,
                region: pick(etablissement.region, ["code", "nom"]),
                code_formation_diplome: certification?.code_formation_diplome,
                diplome: certification?.diplome,
              }),
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info("Nouvelle stats de formation ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats de formation mise à jour", query);
          } else {
            logger.trace("Stats de formation déjà à jour", query);
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
