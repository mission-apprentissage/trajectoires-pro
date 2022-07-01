import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { getBCNTable } from "../common/bcn.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { pick } from "lodash-es";
import { bcn } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { parseAsUTCDate } from "../common/utils/dateUtils.js";
import { getDiplome } from "../common/diplomes.js";

const logger = getLoggerWithContext("import");

export async function streamCfds(options = {}) {
  return compose(
    mergeStreams(
      await getBCNTable("V_FORMATION_DIPLOME", options), //Apprentissage
      await getBCNTable("N_FORMATION_DIPLOME", options)
    ),
    transformData((data) => {
      const code_formation = data["FORMATION_DIPLOME"];

      return {
        type: "cfd",
        code_certification: code_formation,
        libelle: `${data["LIBELLE_COURT"]} ${data["LIBELLE_STAT_33"]}`,
        diplome: getDiplome(code_formation),
        date_fermeture: parseAsUTCDate(data["DATE_FERMETURE"]),
      };
    })
  );
}

export async function streamMefs(options = {}) {
  const stream = await getBCNTable("N_MEF", options);

  return compose(
    stream,
    transformData((data) => {
      const mefstat11 = data["MEF_STAT_11"];

      return {
        type: "mef",
        code_certification: mefstat11,
        libelle: data["LIBELLE_LONG"],
        diplome: getDiplome(data["FORMATION_DIPLOME"]),
        date_fermeture: parseAsUTCDate(data["DATE_FERMETURE"]),
      };
    })
  );
}

export async function importBCN(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    mergeStreams(await streamCfds(options), await streamMefs(options)),
    writeData(
      async (data) => {
        stats.total++;

        if (!data.diplome) {
          logger.warn(`Diplome inconnu pour le code ${data.code_certification}`);
        }

        try {
          const res = await bcn().updateOne(
            {
              code_certification: data.code_certification,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
              },
              $set: omitNil({
                ...pick(data, ["code_certification", "libelle", "diplome", "type", "date_fermeture"]),
              }),
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau code ${data.code_certification} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.info(`Code ${data.code_certification} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Code ${data.code_certification} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le code ${data.code_certification}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );
  return stats;
}
