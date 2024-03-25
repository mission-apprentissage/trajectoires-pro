import { oleoduc, writeData, flattenArray, transformData } from "oleoduc";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { CAFormations } from "#src/common/db/collections/collections.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { CatalogueApprentissageApi } from "#src/services/catalogueApprentissage/CatalogueApprentissageApi.js";
import { merge, range, pick, mapValues } from "lodash-es";
import { Readable } from "stream";
import { ObjectId } from "mongodb";

const logger = getLoggerWithContext("import");

const toObjectId = (val) => new ObjectId(val);
const toDate = (val) => (val ? new Date(val) : null);

const FIELDS_TO_TRANSFORM = {
  etablissement_gestionnaire_id: toObjectId,
  etablissement_formateur_id: toObjectId,
  id: toObjectId,
  bcn_mefs_10: (bcn_mefs_10) => {
    return bcn_mefs_10.map((bcn_mef) => {
      const dateFermeture = toDate(bcn_mef.date_fermeture);
      return {
        mef10: bcn_mef.mef10,
        modalite: {
          duree: bcn_mef.modalite.duree,
          annee: bcn_mef.modalite.annee,
        },
        ...(dateFermeture ? { date_fermeture: dateFermeture } : {}),
      };
    });
  },

  cfd_date_fermeture: toDate,
  periode: (periodes) => {
    return periodes ? periodes.map((p) => toDate(p)) : [];
  },
};

const FIELDS_TO_IMPORT = [
  "etablissement_gestionnaire_id",
  "etablissement_formateur_id",
  "id",
  "bcn_mefs_10",
  "cfd_date_fermeture",
  "etablissement_gestionnaire_siret",
  "etablissement_gestionnaire_enseigne",
  "etablissement_gestionnaire_uai",
  "etablissement_gestionnaire_entreprise_raison_sociale",
  "etablissement_gestionnaire_siren",
  "etablissement_formateur_siret",
  "etablissement_formateur_enseigne",
  "etablissement_formateur_uai",
  "etablissement_formateur_entreprise_raison_sociale",
  "etablissement_formateur_siren",
  "etablissement_reference",
  "cfd",
  "cfd_specialite",
  "cfd_outdated",
  "nom_academie",
  "num_academie",
  "code_postal",
  "code_commune_insee",
  "num_departement",
  "nom_departement",
  "region",
  "localite",
  "uai_formation",
  "nom",
  "intitule_long",
  "intitule_court",
  "diplome",
  "niveau",
  "libelle_court",
  "periode",
  "parcoursup_statut",
  "parcoursup_previous_statut",
  "affelnet_statut",
  "affelnet_previous_statut",
];

export async function importFormations(options = {}) {
  logger.info(`Importation des formations du catalogue de l'apprentissage des ministères éducatifs`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const limitPerPage = options.limitPerPage || 100;
  const catalogueApprentissageOptions = merge(
    { apiOptions: { retry: { retries: 5 } } },
    options.catalogueApprentissageOptions || {}
  );
  const caApi = options.catalogueApprentissage || new CatalogueApprentissageApi(catalogueApprentissageOptions);
  const caQuery = {
    $or: [{ published: true }, { catalogue_published: true }],
    cfd: { $ne: null },
  };

  function handleError(e, context, msg = `Impossible d'importer les formations`) {
    logger.error({ err: e, ...context }, msg);
    stats.failed++;
    return null; //ignore chunk
  }

  await oleoduc(
    Readable.from([
      await caApi
        .fetchFormations(caQuery, { page: 1, limit: 1 })
        .catch((e) => handleError(e, {}, "Impossible de récupérer le nombre de page du catalogue")),
    ]),
    transformData((result) => {
      const nbPages = Math.ceil(result.pagination.total / limitPerPage);
      const pages = range(1, nbPages + 1);
      return pages;
    }),
    flattenArray(),
    transformData(async (page) => {
      try {
        const formations = await caApi.fetchFormations(caQuery, { page: page, limit: limitPerPage });
        return formations.formations;
      } catch (err) {
        return handleError(err, { page });
      }
    }),
    flattenArray(),
    writeData(
      async (data) => {
        const dataToImport = omitNil(
          mapValues(pick(data, FIELDS_TO_IMPORT), (value, key) => {
            return FIELDS_TO_TRANSFORM[key] ? FIELDS_TO_TRANSFORM[key](value) : value;
          })
        );

        stats.total++;

        try {
          const res = await upsert(
            CAFormations(),
            {
              id: dataToImport.id,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: dataToImport,
            }
          );

          if (res.upsertedCount) {
            logger.info(`Nouvelle formation ${data.uai_formation}/${data.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Formation ${data.uai_formation}/${data.cfd} mise à jour`);
            stats.updated++;
          } else {
            logger.trace(`Formation ${data.uai_formation}/${data.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de la formation ${data.uai_formation}/${data.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
}
