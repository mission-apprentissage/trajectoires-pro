import { flattenArray, oleoduc, transformData, writeData, transformStream, compose } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import { BCNApi } from "#src/services/bcn/BCNApi.js";
import * as BCN from "#src/services/bcn/bcn.js";
import BCNMefRepository from "#src/common/repositories/bcnMef.js";

const logger = getLoggerWithContext("import");

export async function importBCNFamilleMetier() {
  logger.info(`Importation des familles de métiers`);
  const stats = { total: 0, updated: 0, failed: 0 };

  const bcnApi = new BCNApi();
  const familleMetier = await BCN.getFamilleMetier(bcnApi);

  await oleoduc(
    await BCN.getLienFamilleMetier(bcnApi),
    transformStream(async (data) => {
      return compose(
        await BCNRepository.find({ code_formation_diplome: data.code_formation_diplome }),
        transformData((bcn) => {
          return { data, bcn };
        })
      );
    }),
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
        const isAnneeCommune = await BCNMefRepository.isAnneeCommune(data.code_formation_diplome);
        try {
          const res = await BCNRepository.updateOne(
            {
              code_certification,
            },
            omitNil({
              familleMetier: {
                ...familleMetier.find((f) => f.code === data.code),
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
