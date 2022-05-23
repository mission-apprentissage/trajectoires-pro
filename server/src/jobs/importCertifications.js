import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { range } from "lodash-es";
import { certifications } from "../common/collections/index.js";
import bunyan from "../common/logger.js";
import { getBCNTable, getNiveau, loadMefs, loadNiveauxFormation } from "../common/bcn.js";
import { mergeArray } from "../common/utils/objectUtils.js";

const logger = bunyan.child({ context: "import" });

function buildAlias(formationDiplome, options = {}) {
  const code_formation = formationDiplome.FORMATION_DIPLOME;
  let mef = options.mefs ? options.mefs.find((d) => d.FORMATION_DIPLOME === code_formation) : null;
  let alias = [];

  if (mef?.MEF) {
    alias.push({ type: "mef", code: mef.MEF });
  }

  if (mef?.MEF_STAT_9) {
    alias.push({ type: "mef_stat_9", code: mef.MEF_STAT_9 });
  }

  if (mef?.MEF_STAT_11) {
    alias.push({ type: "mef_stat_11", code: mef.MEF_STAT_11 });
  }

  range(1, 7).forEach((value) => {
    const code = formationDiplome[`ANCIEN_DIPLOME_${value}`];
    if (code) {
      alias.push({ type: "code_formation_ancien", code });
    }
  });

  range(1, 7).forEach((value) => {
    const code = formationDiplome[`NOUVEAU_DIPLOME_${value}`];
    if (code) {
      alias.push({ type: "code_formation_nouveau", code });
    }
  });

  return alias;
}

async function getCertifications(table, niveaux, options) {
  const formationDiplome = await getBCNTable(table, options);

  return compose(
    formationDiplome,
    transformData((data) => {
      const code_formation = data.FORMATION_DIPLOME;
      const niveau = niveaux.find((d) => d.NIVEAU_FORMATION_DIPLOME === data.NIVEAU_FORMATION_DIPLOME);
      const alias = buildAlias(data, options);

      return {
        code_formation,
        alias: alias,
        ...(niveau
          ? {
              diplome: {
                code: niveau.NIVEAU_INTERMINISTERIEL,
                label: getNiveau(niveau.NIVEAU_INTERMINISTERIEL),
              },
            }
          : {}),
      };
    })
  );
}

async function importCertifications(options = {}) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const niveaux = await loadNiveauxFormation(options);
  const mefs = await loadMefs(niveaux, options);

  await oleoduc(
    mergeStreams(
      await getCertifications("V_FORMATION_DIPLOME", niveaux, options), //Apprentissage
      await getCertifications("N_FORMATION_DIPLOME", niveaux, { ...options, mefs })
    ),
    writeData(async (certification) => {
      const { code_formation } = certification;

      try {
        stats.total++;
        const found = await certifications().findOne({ code_formation });

        if (!certification.diplome) {
          logger.warn(`Niveau inconnu pour le code formation ${code_formation}`);
        }

        const res = await certifications().updateOne(
          {
            code_formation,
          },
          {
            $setOnInsert: {
              code_formation: certification.code_formation,
              ...(certification.diplome ? { diplome: certification.diplome } : {}),
              "_meta.date_import": new Date(),
            },
            $set: {
              alias: mergeArray(found?.alias || [], certification.alias, "code"),
            },
          },
          { upsert: true }
        );

        if (res.upsertedCount) {
          logger.debug(`Nouveau code formation ${code_formation} ajouté`);
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
    })
  );

  return stats;
}

export { importCertifications };
