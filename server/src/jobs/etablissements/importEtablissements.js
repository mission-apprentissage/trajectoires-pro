import { oleoduc, writeData, transformData } from "oleoduc";
import transformation from "transform-coordinates";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { etablissement } from "#src/common/db/collections/collections.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";

const logger = getLoggerWithContext("import");

export async function importEtablissements() {
  logger.info(`Importation des établissements`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const transform = transformation("EPSG:2154", "EPSG:4326");

  await oleoduc(
    await AcceEtablissementRepository.find({
      // Filtre les établissement qui nous intéressent (lycée, CFA ...)
      nature_uai: { $regex: /^[3467]/ },
    }),
    transformData(async (data) => {
      const coordinate =
        data.coordonnee_x && data.coordonnee_y
          ? transform.forward({ x: parseFloat(data.coordonnee_x), y: parseFloat(data.coordonnee_y) })
          : null;

      return {
        uai: data.numero_uai,
        libelle: data.appellation_officielle,
        address: {
          street: data.adresse_uai,
          postCode: data.code_postal_uai,
          city: data.commune_libe,
          cedex: /cedex/i.test(data.localite_acheminement_uai),
        },
        //WGS84
        coordinate: coordinate
          ? {
              type: "Point",
              coordinates: [
                coordinate.x, //longitude
                coordinate.y, //latitude
              ],
            }
          : null,
      };
    }),
    writeData(
      async (data) => {
        stats.total++;

        try {
          const res = await upsert(
            etablissement(),
            {
              uai: data.uai,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...data,
                address: omitNil(data.address),
              }),
            }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau établissement ${data.uai} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Etablissement ${data.uai} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Etablissement ${data.uai} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
