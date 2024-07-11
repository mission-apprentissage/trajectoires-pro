import { oleoduc, writeData, transformData, mergeStreams, concatStreams, compose, filterData } from "oleoduc";
import { omit, pick } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import moment from "#src/common/utils/dateUtils.js";
import { formationEtablissement } from "#src/common/db/collections/collections.js";
import CAFormation from "#src/common/repositories/CAFormation.js";
import { streamOnisepFormations } from "./streamOnisepFormations.js";
import FormationRepository from "#src/common/repositories/formation.js";

const logger = getLoggerWithContext("import");

export const formatDuree = (duree) => duree + " an" + (duree !== "1" ? "s" : "");

async function streamCAFormations({ stats }) {
  return compose(
    mergeStreams(
      // On ne renvoi que les formations post 3ème pour le moment
      //await CAFormation.find({ parcoursup_previous_statut: "publié" }),
      await CAFormation.find({ affelnet_previous_statut: "publié" })
    ),
    filterData((data) => data.uai_formation),
    transformData(async (data) => {
      stats.total++;

      const dataFormatted = {
        uai: data.uai_formation,
        cfd: data.cfd,
        codeDispositif: "",
        voie: "apprentissage",
        millesime: data.periode.map((p) => moment(p).year().toString()),
        duree: formatDuree(data.duree),
      };

      return dataFormatted;
    })
  );
}

export async function importFormationEtablissement() {
  logger.info(`Importation des formations depuis l'onisep' et depuis le catalogue de l'apprentissage`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    // Important des formations depuis l'Idéo actions de formation initiale de l'Onisep et du catalogue de l'apprentissage
    concatStreams(await streamOnisepFormations({ stats }), await streamCAFormations({ stats })),
    // TODO : validate all field
    transformData((data) => {
      return {
        ...data,
        uai: data.uai.toUpperCase(),
      };
    }),
    filterData(async (data) => {
      const formationInfo = await FormationRepository.first({ cfd: data.cfd });
      return formationInfo;
    }),
    writeData(
      async (data) => {
        try {
          const res = await upsert(formationEtablissement(), pick(data, ["uai", "cfd", "voie", "codeDispositif"]), {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omit(omitNil(data), ["millesime"]),
            $addToSet: {
              millesime: { $each: data.millesime },
            },
          });

          if (res.upsertedCount) {
            logger.info(`Nouvelle formation ${data.uai}/${data.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Formation ${data.uai}/${data.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Formation ${data.uai}/${data.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de la formation ${data.uai}/${data.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
