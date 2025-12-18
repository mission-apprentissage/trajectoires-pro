import { flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import { Readable } from "stream";
import { pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { certificationsStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import {
  computeCustomStats,
  getMillesimesSup,
  INSERSUP_STATS_NAMES,
  INSERSUP_CUSTOM_STATS_NAMES,
} from "#src/common/stats.js";
import { getCertificationSupInfo } from "#src/common/certification.js";
import { InserSup } from "#src/services/dataEnseignementSup/InserSup.js";

const logger = getLoggerWithContext("import");

export async function importCertificationsSupStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  // Set a default retry for the InserJeunes API
  const insersupOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.insersupOptions || {});
  const insersup = options.insersup || new InserSup(insersupOptions);
  const millesimes = options.millesimes || getMillesimesSup();

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  logger.info(`Import des stats pour ${millesimes.length} millesime...`);

  await oleoduc(
    Readable.from(millesimes),
    transformData(
      (millesime) => {
        return insersup.getCertificationsStatsStream(millesime);
      },
      { parallel: 1 }
    ),
    flattenArray(),
    writeData(async (stream) => {
      await oleoduc(
        stream,
        writeData(
          async (formationStats) => {
            const query = {
              code_certification: formationStats.diplome,
              millesime: formationStats.millesime,
              filiere: "superieur",
            };
            let formatted = null;

            try {
              const certification = await getCertificationSupInfo(formationStats.diplome);
              const stats = omitNil(pick(formationStats, ["millesime", ...INSERSUP_STATS_NAMES]));
              const customStats = computeCustomStats(stats, "insersup", INSERSUP_CUSTOM_STATS_NAMES);

              // Delete data compute with continuum job (= when type is not self)
              await certificationsStats().deleteOne({
                ...query,
                "donnee_source.type": { $ne: "self" },
              });

              formatted = {
                ...query,
                ...stats,
                ...customStats,
                ...certification,
                filiere: "superieur",
                donnee_source: {
                  code_certification: formationStats.diplome,
                  type: "self",
                },
                "_meta.insersup": omitNil({
                  type_diplome: formationStats.type_diplome_long,
                  domaine_disciplinaire: formationStats.dom_lib,
                  secteur_disciplinaire: formationStats.sectdis_lib,
                  discipline: formationStats.discipli_lib,
                }),
              };

              const res = await upsert(certificationsStats(), query, {
                $setOnInsert: {
                  "_meta.date_import": new Date(),
                  "_meta.created_on": new Date(),
                  "_meta.updated_on": new Date(),
                },
                $set: omitNil(formatted),
              });

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
              handleError(e, { query, formatted });
            }
          },
          { parallel: 1 }
        )
      );
    })
  );

  return jobStats;
}
