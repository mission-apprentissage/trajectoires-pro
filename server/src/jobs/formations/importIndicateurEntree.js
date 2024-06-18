import { oleoduc, writeData, transformData, compose, filterData } from "oleoduc";
import { isNil, pick } from "lodash-es";
import { updateOne } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { formationEtablissement } from "#src/common/db/collections/collections.js";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { createReadStream } from "fs";
import config from "#src/config.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement.js";

const logger = getLoggerWithContext("import");

function parseExportOrion(filePath) {
  const stream = compose(createReadStream(filePath));
  return compose(
    stream,
    parseCsv({
      delimiter: ";",
      quote: null,
      cast: (value) => {
        if (typeof value === "number") {
          return value;
        }

        // Parse field with excel format "=""VALUE"""
        const match = value.match(/"=""(.*)"""/);
        if (!match) {
          return value;
        }
        return match[1];
      },
    })
  );
}

export async function importIndicateurEntree(options = {}) {
  logger.info(`Importation des indicateurs d'entrées depuis orion`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const exportEtablissementsOrionFilePath =
    options.exportEtablissementsOrionFilePath || config.orion.files.exportEtablissements;

  const formatInt = (v) => (isNil(v) ? null : parseInt(v));
  const formatFloat = (v) => (isNil(v) ? null : parseFloat(v.replace(",", ".")));

  await oleoduc(
    parseExportOrion(exportEtablissementsOrionFilePath),
    transformData(async (data) => {
      const cfd = data["Code formation diplôme"];
      const uai = data["UAI"];
      const codeDispositif = data["Code dispositif"];
      const formation = await FormationEtablissementRepository.first({
        cfd,
        uai,
        codeDispositif,
        voie: "scolaire",
      });

      if (!formation) {
        logger.trace(`Aucune formation pour le CFD : ${cfd}, Code dispositif: ${codeDispositif}, UAI: ${uai}`);
        return null;
      }

      return {
        formation,
        data,
      };
    }),
    filterData((data) => data),
    writeData(
      async ({ formation, data }) => {
        const indicateurEntree = {
          rentreeScolaire: data["RS"],
          capacite: formatInt(data["Capacité"]),
          premiersVoeux: formatInt(data["Nb de premiers voeux"]),
          effectifs: formatInt(data["Année 1"]),
          tauxPression: formatFloat(data["Tx de pression"]),
        };

        try {
          const res = await updateOne(
            formationEtablissement(),
            pick(formation, ["uai", "cfd", "voie", "codeDispositif"]),
            {
              $set: {
                indicateurEntree: omitNil(indicateurEntree),
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Indicateur de formation ${formation.uai}/${formation.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Indicateur de formation ${formation.uai}/${formation.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Indicateur de formation ${formation.uai}/${formation.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de la formation ${formation.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
