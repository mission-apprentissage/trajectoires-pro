import { mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { getBCNTable } from "../common/bcn.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { pick, range } from "lodash-es";
import { cfds } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import { parseAsUTCDate } from "../common/utils/dateUtils.js";
import { getDiplome } from "../common/diplomes.js";

const logger = getLoggerWithContext("import");

export async function importCfds(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    mergeStreams(
      await getBCNTable("V_FORMATION_DIPLOME", options), //Apprentissage
      await getBCNTable("N_FORMATION_DIPLOME", options)
    ),
    transformData((data) => {
      const code_formation = data["FORMATION_DIPLOME"];
      const dateFermeture = data["DATE_FERMETURE"];
      const codeFormationAlternatifs = range(1, 7)
        .flatMap((value) => [`ANCIEN_DIPLOME_${value}`, `NOUVEAU_DIPLOME_${value}`])
        .map((columnName) => data[columnName])
        .filter((v) => v);

      return {
        code_formation,
        libelle: `${data["LIBELLE_COURT"]} ${data["LIBELLE_STAT_33"]}`,
        diplome: getDiplome(code_formation),
        code_formation_alternatifs: codeFormationAlternatifs,
        date_fermeture: parseAsUTCDate(dateFermeture),
      };
    }),
    writeData(
      async (cfd) => {
        stats.total++;

        if (!cfd.diplome) {
          logger.warn(`Diplome inconnu pour le CFD ${cfd.code_formation}`);
        }

        try {
          const res = await cfds().updateOne(
            {
              code_formation: cfd.code_formation,
            },
            {
              $setOnInsert: omitNil({
                "_meta.date_import": new Date(),
                ...pick(cfd, ["code_formation", "libelle", "diplome"]),
              }),
              $set: omitNil({
                date_fermeture: cfd.date_fermeture,
              }),
              $addToSet: {
                code_formation_alternatifs: { $each: cfd.code_formation_alternatifs },
              },
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau CFD ${cfd.code_formation} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.info(`CFD ${cfd.code_formation} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`CFD ${cfd.code_formation} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le CFD  ${cfd.code_formation}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}