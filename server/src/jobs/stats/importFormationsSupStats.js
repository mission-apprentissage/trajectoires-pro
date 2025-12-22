import { filterData, oleoduc, transformData, writeData } from "oleoduc";
import { pick, merge } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { formationsStats } from "#src/common/db/collections/collections.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { findAcademieByCode, findRegionByCodeInsee } from "#src/services/regions.js";
import {
  computeCustomStats,
  getMillesimesFormationsSup,
  INSERSUP_CUSTOM_STATS_NAMES,
  INSERSUP_STATS_NAMES,
} from "#src/common/stats.js";
import { getCertificationSupInfo } from "#src/common/certification.js";
import { InserSupApi } from "#src/services/insersup/InsersupApi.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";

const logger = getLoggerWithContext("import");

async function checkMillesimeInDouble(jobStats, millesimes) {
  logger.info(`Vérification des millésimes en double...`);

  for (const millesime of millesimes) {
    const results = await FormationStatsRepository.findMillesimeInDouble(millesime);
    for (const result of results) {
      const formatted = {
        ...pick(result, ["uai", "code_certification", "filiere"]),
        millesimes: [result.millesime, ...result.others.map((r) => r.millesime)],
      };
      logger.error(`Millésime en double pour : `, formatted);
      jobStats.error = `Millésime en double pour : ${JSON.stringify(formatted)}`;
    }
  }
}

function formatData(data) {
  const formatMillesime = (data) => {
    const cumulImpossible = /\*\*/.test(data.nb_sortants);
    const hasCumul = /\*/.test(data.nb_sortants);

    if (cumulImpossible || !hasCumul) {
      return data.annee_universitaire.split("-")[1];
    }
    return data.annee_universitaire.replace("-", "_");
  };
  const formatInt = (str) =>
    str.substr(0, 2) === "nd" || str.substr(0, 2) === "na" ? null : parseInt(str.replaceAll("*", ""));

  const formatted = {
    uai: data.etablissement,
    code_certification: data.diplome || data.diplome_consol, // InserSup API changed its specifications
    millesime: formatMillesime(data),
    nb_poursuite_etudes: formatInt(data.nb_poursuivants),
    nb_annee_term: formatInt(data.nb_inscrits),
    nb_diplome: formatInt(data.nb_diplomes),
    nb_sortant: formatInt(data.nb_sortants),
    nb_en_emploi_24_mois: formatInt(data.nb_in_dsn_24),
    nb_en_emploi_18_mois: formatInt(data.nb_in_dsn_18),
    nb_en_emploi_12_mois: formatInt(data.nb_in_dsn_12),
    nb_en_emploi_6_mois: formatInt(data.nb_in_dsn_6),
    salaire_12_mois_q1: formatInt(data.salaire_q1_national_diplome_12),
    salaire_12_mois_q2: formatInt(data.salaire_q2_national_diplome_12),
    salaire_12_mois_q3: formatInt(data.salaire_q3_national_diplome_12),
    libelle_etablissement: data.denomination_principale,
    _meta: {
      insersup: {
        etablissement_libelle: data.denomination_principale,
        etablissement_actuel_libelle: data.denomination_principale,
        type_diplome: data.type_diplome_long,
        domaine_disciplinaire: data.domaine,
        secteur_disciplinaire: data.secteur_disciplinaire,
        discipline: data.discipline,
      },
    },
  };

  return formatted;
}

async function verifyExistOtherDiscipline(formationStats) {
  const metaInsersup = formationStats._meta.insersup;
  const millesimePart = formationStats.millesime.split("_");

  const existOtherDiscip = await FormationStatsRepository.first({
    uai: formationStats.uai,
    code_certification: formationStats.code_certification,
    filiere: "superieur",
    millesime: { $regex: new RegExp(`${millesimePart[millesimePart.length - 1]}$`) },
    $or: [
      { "_meta.insersup.domaine_disciplinaire": { $ne: metaInsersup.domaine_disciplinaire } },
      { "_meta.insersup.secteur_disciplinaire": { $ne: metaInsersup.secteur_disciplinaire } },
      { "_meta.insersup.discipline": { $ne: metaInsersup.discipline } },
    ],
  });

  if (existOtherDiscip) {
    return true;
  }
  return false;
}

export async function importFormationsSupStats(options = {}) {
  const jobStats = { created: 0, updated: 0, failed: 0 };

  // Set a default retry for the InserJeunes API
  const insersupOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.insersupOptions || {});
  const insersup = options.insersup || new InserSupApi(insersupOptions);
  const millesimes = options.millesimes || getMillesimesFormationsSup();

  function handleError(e, context) {
    logger.error({ err: e, ...context }, `Impossible d'importer les stats`);
    jobStats.failed++;
    return null; //ignore chunk
  }

  logger.info(`Import des stats pour ${millesimes.length} millesime...`);

  await oleoduc(
    await insersup.fetchEtablissementStats(),
    transformData(formatData),
    filterData((data) => {
      for (const millesime of millesimes) {
        const millesimePart = millesime.split("_");
        if (data.millesime === millesime || millesimePart.includes(data.millesime)) {
          return true;
        }
      }
      return false;
    }),
    transformData(async (stats) => {
      const acce = await AcceEtablissementRepository.first({ numero_uai: stats.uai });
      if (!acce) {
        handleError(new Error(`Etablissement ${stats.uai} inconnu dans l'ACCE`));
        return null;
      }

      const region = findRegionByCodeInsee(acce.departement_insee_3);
      if (!region) {
        handleError(new Error(`Région inconnue pour l'établissement ${stats.uai}`), {
          departement_insee_3: acce.departement_insee_3,
          uai: stats.uai,
        });
        return null;
      }

      const academie = findAcademieByCode(acce.academie);
      if (!academie) {
        handleError(new Error(`Académie ${acce.academie} inconnue pour l'établissement ${stats.uai}`));
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
    writeData(async ({ data, stats: formationStats }) => {
      const query = {
        uai: formationStats.uai,
        code_certification: formationStats.code_certification,
        millesime: formationStats.millesime,
        filiere: "superieur",
      };

      try {
        const certification = await getCertificationSupInfo(formationStats.code_certification);
        const stats = omitNil(pick(formationStats, ["uai", "millesime", ...INSERSUP_STATS_NAMES]));
        const customStats = computeCustomStats(stats, "insersup", INSERSUP_CUSTOM_STATS_NAMES);

        if (!certification) {
          handleError(new Error(`Diplome ${formationStats.code_certification} inconnu`));
          return null;
        }

        // Delete data compute with continuum job (= when type is not self)
        await formationsStats().deleteOne({
          ...query,
          "donnee_source.type": { $ne: "self" },
        });

        // TODO: gérer les secteur disciplinaire (un même SISE avec plusieurs données différentes)
        // Pour le moment on n'en conserve qu'un seul
        if (await verifyExistOtherDiscipline(formationStats)) {
          logger.info("La formation existe déjà dans une autre discipline", query);
          return;
        }

        const formatted = {
          ...query,
          ...stats,
          ...customStats,
          ...certification,
          filiere: "superieur",
          region: pick(data.region, ["code", "nom"]),
          academie: pick(data.academie, ["code", "nom"]),
          donnee_source: {
            code_certification: formationStats.code_certification,
            type: "self",
          },
          libelle_etablissement: formationStats.libelle_etablissement,
          "_meta.insersup": omitNil(formationStats._meta.insersup),
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
        handleError(e, { query, formationStats });
      }
    })
  );

  // Vérifie que l'on a pas un mélange millésime unique/aggregé pour une même année/formation
  // Actuellement le cas n'existe pas, on met une alerte au cas ou
  // Si le cas apparait : modifier les routes bulks pour envoyer l'information suivant les règles de priorités des millésimes
  await checkMillesimeInDouble(jobStats, millesimes);

  return jobStats;
}
