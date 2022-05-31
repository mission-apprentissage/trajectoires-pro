import { mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { codeFormationDiplomes } from "../common/collections/index.js";
import bunyan from "../common/logger.js";
import { getBCNTable, loadMefs } from "../common/bcn.js";
import { omitNil } from "../common/utils/objectUtils.js";
import { pick, range } from "lodash-es";
import { getDiplome } from "../common/actions/getDiplome.js";

const logger = bunyan.child({ context: "import" });

async function importCodeFormationDiplomes(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const mefs = await loadMefs(options);

  await oleoduc(
    mergeStreams(
      await getBCNTable("V_FORMATION_DIPLOME", options), //Apprentissage
      await getBCNTable("N_FORMATION_DIPLOME", options)
    ),
    transformData((data) => {
      const code_formation = data["FORMATION_DIPLOME"];
      const libelle = `${data["LIBELLE_COURT"]} ${data["LIBELLE_STAT_33"]}`;

      const codeFormationAlternatifs = range(1, 7)
        .flatMap((value) => [`ANCIEN_DIPLOME_${value}`, `NOUVEAU_DIPLOME_${value}`])
        .map((columnName) => data[columnName])
        .filter((v) => v);

      const codeMefs = mefs
        .filter((m) => m["FORMATION_DIPLOME"] === code_formation)
        .reduce(
          (acc, m) => {
            return {
              mef: omitNil([...acc.mef, m.MEF]),
              mef_stats_9: omitNil([...acc.mef_stats_9, m.MEF_STAT_9]),
              mef_stats_11: omitNil([...acc.mef_stats_11, m.MEF_STAT_11]),
            };
          },
          {
            mef: [],
            mef_stats_9: [],
            mef_stats_11: [],
          }
        );

      return omitNil({
        code_formation,
        libelle,
        diplome: getDiplome(code_formation),
        code_formation_alternatifs: codeFormationAlternatifs,
        ...codeMefs,
      });
    }),
    writeData(
      async (cfd) => {
        const { code_formation } = cfd;

        try {
          stats.total++;

          if (!cfd.diplome) {
            logger.warn(`Diplome inconnu pour le code formation ${code_formation}`);
          }

          const res = await codeFormationDiplomes().updateOne(
            {
              code_formation,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                ...pick(cfd, ["code_formation", "libelle", "diplome"]),
              },
              $addToSet: {
                code_formation_alternatifs: { $each: cfd.code_formation_alternatifs },
                mef: { $each: cfd.mef },
                mef_stats_9: { $each: cfd.mef_stats_9 },
                mef_stats_11: { $each: cfd.mef_stats_11 },
              },
            },
            { upsert: true }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau code formation ${code_formation} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.info(`Code formation ${code_formation} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Code formation ${code_formation} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'importer le code formation  ${code_formation}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}

export { importCodeFormationDiplomes };
