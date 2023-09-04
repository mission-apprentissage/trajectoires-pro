import { oleoduc, transformData, writeData } from "oleoduc";
import { getBCNTable } from "#src/services/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { omit } from "lodash-es";
import { bcn } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";

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

export async function importBCNContinuum(options = {}) {
  const stats = { total: 0, updated: 0, failed: 0 };

  await oleoduc(
    await getBCNTable("N_FORMATION_DIPLOME", options),
    transformData((data) => {
      const parseDiplomeList = (match, data) => {
        const list = Object.keys(data)
          .filter((key) => key.startsWith(match))
          .map((key) => data[key]);
        return list;
      };

      const newData = {
        code_certification: data["FORMATION_DIPLOME"],
        date_premiere_session: data["DATE_PREMIERE_SESSION"] || null,
        date_derniere_session: data["DATE_DERNIERE_SESSION"] || null,
      };

      return {
        ...newData,
        ancien_diplome: parseDiplomeList("ANCIEN_DIPLOME_", data).filter((c) => c != newData.code_certification),
        nouveau_diplome: parseDiplomeList("NOUVEAU_DIPLOME_", data).filter((c) => c != newData.code_certification),
      };
    }),
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
