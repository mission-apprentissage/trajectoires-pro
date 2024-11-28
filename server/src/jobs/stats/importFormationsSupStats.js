import { flattenArray, oleoduc, transformData, writeData, filterData } from "oleoduc";
import { Readable } from "stream";
import { pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { findRegionByNom, findAcademieByNom } from "#src/services/regions.js";
import { computeCustomStats, getMillesimesFormationsSup, INSERSUP_STATS_NAMES } from "#src/common/stats.js";
import { getCertificationSupInfo } from "#src/common/certification.js";
import { InserSup } from "#src/services/dataEnseignementSup/InserSup.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";

const logger = getLoggerWithContext("import");

function formatStats(stats) {
  return {
    ...stats,
    nb_poursuite_etudes: stats.nb_poursuivants,
    nb_sortant: stats.nb_sortants,
    nb_diplome: stats.nb_diplomes,
    nb_annee_term: stats.nb_diplomes, // InserSup devrait mettre à jour ces données,
    //pour le moment on considère que le nombre en années terminale est le nombre de diplomées
  };
}

async function checkMillesimeInDouble(jobStats, millesimes) {
  for (const millesime of millesimes) {
    const results = await FormationStatsRepository.findMillesimeInDouble(millesime);
    for (const result of results) {
      jobStats.failed++;
      const formatted = {
        ...pick(result, ["uai", "code_certification", "filiere"]),
        millesimes: [result.millesime, ...result.others.map((r) => r.millesime)],
      };
      logger.error(`Millésime en double pour : `, formatted);
      jobStats.error = `Millésime en double pour : ${JSON.stringify(formatted)}`;
    }
  }
}

export async function importFormationsSupStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  // Set a default retry for the InserJeunes API
  const insersupOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.insersupOptions || {});
  const insersup = options.insersup || new InserSup(insersupOptions);
  const millesimes = options.millesimes || getMillesimesFormationsSup();

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  logger.info(`Import des stats pour ${millesimes.length} millesime...`);

  await oleoduc(
    Readable.from(await insersup.getEtablissements()),
    flattenArray(),
    transformData((etablissement) => {
      return millesimes.map((millesime) => ({
        millesime,
        etablissement,
      }));
    }),
    flattenArray(),
    transformData(({ millesime, etablissement }) => {
      return insersup.getFormationsStatsStream(etablissement.etablissement, millesime);
    }),
    flattenArray(),
    filterData((stats) => stats.diplome !== "all"),
    transformData((stats) => {
      const region = findRegionByNom(stats.reg_nom);
      if (!region) {
        handleError(new Error(`Région inconnue pour l'établissement ${stats.etablissement}`));
        return null;
      }

      const academie = findAcademieByNom(stats.aca_nom);
      if (!academie) {
        handleError(new Error(`Académie inconnue pour l'établissement ${stats.etablissement}`));
        return null;
      }

      return {
        stats: stats,
        data: {
          region,
          academie,
        },
      };
    }),
    writeData(
      async ({ data, stats: formationStats }) => {
        const query = {
          uai: formationStats.etablissement,
          code_certification: formationStats.diplome,
          millesime: formationStats.millesime,
          filiere: "superieur",
        };

        try {
          const certification = await getCertificationSupInfo(formationStats.diplome);
          const stats = omitNil(pick(formatStats(formationStats), INSERSUP_STATS_NAMES));
          const customStats = computeCustomStats(stats);

          // Delete data compute with continuum job (= when type is not self)
          await formationsStats().deleteOne({
            ...query,
            "donnee_source.type": { $ne: "self" },
          });

          const formatted = {
            ...stats,
            ...customStats,
            ...certification,
            filiere: "superieur",
            region: pick(data.region, ["code", "nom"]),
            academie: pick(data.academie, ["code", "nom"]),
            donnee_source: {
              code_certification: formationStats.diplome,
              type: "self",
            },
            libelle_etablissement: formationStats.uo_lib,
            "_meta.insersup": {
              etablissement_libelle: formationStats.uo_lib,
              etablissement_actuel_libelle: formationStats.uo_lib_actuel,
              type_diplome: formationStats.type_diplome_long,
              domaine_disciplinaire: formationStats.dom_lib,
              secteur_disciplinaire: formationStats.sectdis_lib,
              discipline: formationStats.discipli_lib,
            },
          };

          const res = await upsert(formationsStats(), query, {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil(formatted),
          });

          if (res.upsertedCount) {
            logger.info("Nouvelle stats de formation ajoutée", query);
            jobStats.created++;
          } else if (res.modifiedCount) {
            jobStats.updated++;
            logger.debug("Stats de formation mise à jour", query);
          } else {
            logger.trace("Stats de formation déjà à jour", query);
          }
        } catch (e) {
          handleError(e, query);
        }
      },
      { parallel: 10 }
    )
  );

  // Vérifie que l'on a pas un mélange millésime unique/aggregé pour une même année/formation
  // Actuellement le cas n'existe pas, on met une alerte au cas ou
  // Si le cas apparait : modifier les routes bulks pour envoyer l'information suivant les règles de priorités des millésimes
  await checkMillesimeInDouble(jobStats, millesimes);

  return jobStats;
}
