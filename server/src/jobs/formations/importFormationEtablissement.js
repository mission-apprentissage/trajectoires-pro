import { oleoduc, writeData, transformData, mergeStreams, compose, filterData } from "oleoduc";
import moment from "moment";
import { omit } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { constatRentree } from "#src/services/educationGouv/educationGouv.js";
import { formationEtablissement } from "#src/common/db/collections/collections.js";
import BCNMefRepository from "#src/common/repositories/bcnMef.js";
import CAFormation from "#src/common/repositories/CAFormation.js";

const logger = getLoggerWithContext("import");

function streamConstatRentree({ constatRentreeFilePath, stats }) {
  return compose(
    constatRentree(constatRentreeFilePath),
    transformData(async (data) => {
      stats.total++;

      const mef11 = data["Mef Bcp 11"];
      const bcnMef = await BCNMefRepository.first({ mef_stat_11: mef11 });
      if (!bcnMef) {
        logger.error(`Le MEF11 ${mef11} n'existe pas`);
        stats.failed++;
        return;
      }

      const dataFormatted = {
        uai: data["UAI"],
        cfd: bcnMef.formation_diplome,
        codeDispositif: bcnMef.dispositif_formation,
        voie: "scolaire",
        millesime: [data["Rentrée scolaire"]],
      };

      return dataFormatted;
    })
  );
}

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
      };

      return dataFormatted;
    })
  );
}

export async function importFormationEtablissement(options = {}) {
  logger.info(`Importation des formations depuis le constat de rentrée et depuis le catalogue de l'apprentissage`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const constatRentreeFilePath = options.constatRentreeFilePath || null;

  await oleoduc(
    // Importation des formations depuis le constat de rentrée (voie scolaire)
    mergeStreams(streamConstatRentree({ constatRentreeFilePath, stats }), await streamCAFormations({ stats })),
    writeData(
      async (data) => {
        try {
          const res = await upsert(formationEtablissement(), omit(data, ["millesime"]), {
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
          console.log("key", omit(data, ["millesime"]));
          logger.error(e, `Impossible d'ajouter les données de la formation ${data.uai}/${data.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}