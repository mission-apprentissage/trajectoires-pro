import { oleoduc, transformData, writeData, filterData } from "oleoduc";
import { omitNil } from "../common/utils/objectUtils.js";
import { omit } from "lodash-es";
import toArray from "stream-to-array";
import { bcn } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import BCNRepository from "../common/repositories/bcn.js";
import BCNMefRepository from "../common/repositories/bcnMef.js";

const logger = getLoggerWithContext("import");

async function updateDiplomeList(data) {
  const res = await bcn().updateOne(
    {
      code_certification: data.code_certification,
    },
    {
      $set: omitNil(omit(data, "ancien_diplome", "nouveau_diplome")),
      $addToSet: {
        ancien_diplome: { $each: data.ancien_diplome },
        nouveau_diplome: { $each: data.nouveau_diplome },
      },
    }
  );

  const resOldDiplome =
    data.ancien_diplome?.length > 0
      ? await bcn().updateMany(
          { code_certification: { $in: data.ancien_diplome } },
          {
            $addToSet: {
              nouveau_diplome: data.code_certification,
            },
          }
        )
      : null;

  const resNewDiplome =
    data.nouveau_diplome?.length > 0
      ? await bcn().updateMany(
          { code_certification: { $in: data.nouveau_diplome } },
          {
            $addToSet: {
              ancien_diplome: data.code_certification,
            },
          }
        )
      : null;

  const isModified = res.modifiedCount || resOldDiplome?.modifiedCount || resNewDiplome?.modifiedCount;
  return { isModified, res, resOldDiplome, resNewDiplome };
}

async function getMefFromCfd(cfd, parentMef) {
  const result = await BCNMefRepository.find({
    formation_diplome: cfd,
    dispositif_formation: parentMef.dispositif_formation,
  })
    .then((stream) => toArray(stream))
    .then((result) =>
      result.find(({ mef_stat_11 }) => mef_stat_11.substr(0, 4) === parentMef.mef_stat_11.substr(0, 4))
    );

  return result;
}

export async function computeBCNMEFContinuum() {
  const stats = { total: 0, updated: 0, failed: 0 };

  await oleoduc(
    bcn().find({ type: "mef" }).stream(),
    transformData(async (data) => {
      // Get CFD and Mef
      const diplomeCfd = await BCNRepository.first({ code_certification: data.code_formation_diplome });
      const diplomeMef = await BCNMefRepository.first({ mef_stat_11: data.code_certification });

      if (!diplomeMef) {
        logger.error(`Le diplome ${data.code_certification} n'existe pas dans la table Mef`);
        return null;
      }

      // Get old MEFs
      const oldMefs = await Promise.all(diplomeCfd.ancien_diplome.map((oldCfd) => getMefFromCfd(oldCfd, diplomeMef)));

      // Get new MEFs
      const newMefs = await Promise.all(diplomeCfd.nouveau_diplome.map((newCfd) => getMefFromCfd(newCfd, diplomeMef)));

      const newData = {
        code_certification: data.code_certification,
        date_premiere_session: diplomeCfd.date_premiere_session,
        date_derniere_session: diplomeCfd.date_derniere_session,
        ancien_diplome: omitNil(oldMefs).map((d) => d.mef_stat_11),
        nouveau_diplome: omitNil(newMefs).map((d) => d.mef_stat_11),
      };

      return newData;
    }),
    filterData((v) => v),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await updateDiplomeList(data);

          if (res.isModified) {
            logger.debug(`Code ${data.code_certification} mis à jour`);
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
