import { filterData, flattenArray, oleoduc, transformData, writeData } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import * as BCN from "#src/services/bcn.js";
import BCNMefRepository from "#src/common/repositories/bcnMef.js";

const logger = getLoggerWithContext("import");

export async function importBCNFamilleMetier(options = {}) {
  logger.info(`Importation des familles de métiers`);
  const stats = { total: 0, updated: 0, failed: 0 };

  const familleMetierFilePath = options.familleMetierFilePath || null;
  const lienFamilleMetierFilePath = options.lienFamilleMetierFilePath || null;

  const familleMetier = await BCN.getFamilleMetier(familleMetierFilePath);

  await oleoduc(
    BCN.getLienFamilleMetier(lienFamilleMetierFilePath),
    transformData(async (data) => {
      const bcnMef = await BCNMefRepository.first({
        mef: data["MEF"],
      });
      if (!bcnMef) {
        return null;
      }

      const bcn = await BCNRepository.first({
        code_certification: bcnMef.mef_stat_11,
      });
      if (!bcn) {
        return null;
      }

      return { data, bcn };
    }),
    filterData((d) => d),
    transformData(async (data) => {
      const formationWithContinuum = await BCNRepository.cfdsParentAndChildren(data.bcn.code_certification);
      return formationWithContinuum.map((f) => {
        return {
          ...data,
          code_certification: f,
        };
      });
    }),
    flattenArray(),
    writeData(
      async ({ code_certification, data }) => {
        stats.total++;
        const isAnneeCommune = data["tag"] === "2NDE PRO COMMUNE";
        try {
          const res = await BCNRepository.updateOne(
            {
              code_certification,
            },
            omitNil({
              familleMetier: {
                ...familleMetier.find((f) => f.code === data["FAMILLE_METIER"]),
                isAnneeCommune,
              },
            })
          );

          if (res.modifiedCount) {
            logger.debug(`Famille de métier pour ${data.code_certification} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Famille de métier pour ${data.code_certification} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la famille de métier pour la certification ${data.code_certification}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
