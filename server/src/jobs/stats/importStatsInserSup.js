import { oleoduc, transformData, writeData } from "oleoduc";
import { Readable } from "stream";
import { pick, merge, mapValues } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { OmogenApi } from "#src/services/omogenApi/OmogenApi.js";
import { tmpInserSup } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";

const logger = getLoggerWithContext("import");

export async function importStatsInserSup(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  const omogenApiOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.omogenApiOptions || {});
  const omogenApi = options.omogenApi || new OmogenApi(omogenApiOptions);

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  logger.info(`Import des stats...`);

  await oleoduc(
    Readable.from(await omogenApi.fetchInserSup()),
    transformData((params) => {
      const toInteger = (obj, keys) => {
        return mapValues(pick(obj, keys), (v) => (["na", "nd"].includes(v) ? null : parseInt(v)));
      };

      const toNumber = (obj, keys) => {
        return mapValues(pick(obj, keys), (v) => (["na", "nd"].includes(v) ? null : parseFloat(v.replace(",", "."))));
      };

      const computeAnneeUniversitaire = (obj) => {
        const part = obj.sortants.split(" ");
        const nbrYears = part[1] ? part[1].split("").length + 1 : 1;

        const years = obj.annee_universitaire;
        const yearPart = years.split("-").map((v) => parseInt(v));

        return {
          annee_universitaire: `${yearPart[1] - nbrYears}-${yearPart[1]}`,
          annee_universitaire_start: yearPart[1],
          annee_universitaire_end: yearPart[1] - nbrYears,
          annees_universitaire: new Array(nbrYears)
            .fill(null)
            .map((_, index) => {
              return `${yearPart[1] - index - 1}-${yearPart[1] - index}`;
            })
            .reverse(),
        };
      };

      return {
        stats: {
          ...params,
          ...computeAnneeUniversitaire(params),
          ...toInteger(params, [
            "diplomes",
            "sortants",
            "poursuivants",
            "in_dsn_6",
            "in_dsn_12",
            "in_dsn_18",
            "in_dsn_24",
            "in_dsn_30",
          ]),
          ...toNumber(params, [
            "taux_poursuivant",
            "taux_in_dsn_6",
            "taux_in_dsn_12",
            "taux_in_dsn_18",
            "taux_in_dsn_24",
            "taux_in_dsn_30",
          ]),
        },
      };
    }),
    writeData(
      async ({ stats }) => {
        const query = {
          diplome: stats.diplome,
          etablissement: stats.etablissement,
          annee_universitaire: stats.annee_universitaire,
        };

        try {
          const res = await upsert(tmpInserSup(), query, {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil({
              ...stats,
            }),
          });

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
