import { oleoduc, transformData, writeData } from "oleoduc";
import { bcn } from "#src/common/db/collections/collections.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import removeAccents from "remove-accents";

const logger = getLoggerWithContext("import");

async function getOldLibelle(diplome) {
  const cleanLibelle = (name) => removeAccents(name.trim());

  // Get the first different libelle
  const currentLibelle = cleanLibelle(diplome.libelle_long);
  let previous = diplome;
  while (previous.ancien_diplome.length === 1) {
    previous = await BCNRepository.first({ code_certification: previous.ancien_diplome[0] });
    const libelle = previous.libelle_long;
    const libelleClean = cleanLibelle(libelle);
    if (currentLibelle !== libelleClean && !currentLibelle.includes(libelleClean)) {
      return libelle;
    }
  }

  return null;
}

export async function importLibelle() {
  logger.info(`Importation des libelles et anciens libelles des formations`);
  const stats = { total: 0, updated: 0, failed: 0 };

  await oleoduc(
    bcn().find({}).stream(),
    transformData(async (data) => {
      const diplomeCfd =
        data.type === "mef" ? await BCNRepository.first({ code_certification: data.code_formation_diplome }) : data;

      const newData = {
        code_certification: data.code_certification,
        libelle_long: diplomeCfd.libelle_long,
        libelle_long_ancien: await getOldLibelle(diplomeCfd),
      };

      return newData;
    }),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await bcn().updateOne(
            {
              code_certification: data.code_certification,
            },
            {
              $set: omitNil(data),
            }
          );

          if (res.modifiedCount) {
            logger.debug(`Libellés pour ${data.code_certification} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Libellés pour ${data.code_certification} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les libellés pour la certification ${data.code_certification}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
