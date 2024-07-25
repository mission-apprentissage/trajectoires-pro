import { oleoduc, writeData, transformData } from "oleoduc";
import transformation from "transform-coordinates";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { etablissement } from "#src/common/db/collections/collections.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";
import OnisepRaw from "#src/common/repositories/onisepRaw.js";
import { parseJourneesPortesOuvertes } from "#src/services/onisep/etablissement.js";
import { get } from "lodash-es";

const logger = getLoggerWithContext("import");

function formatStatutEtablissement(statut) {
  if (!statut) {
    return { statut: null, statutDetail: null };
  }

  switch (statut.toLowerCase()) {
    case "privé":
      return { statut: "privé", statutDetail: null };
    case "public":
      return { statut: "public", statutDetail: null };
    case "privé hors contrat":
      return { statut: "privé", statutDetail: "hors contrat" };
    case "privé reconnu par l'etat":
      return { statut: "privé", statutDetail: "reconnu par l'Etat" };
    case "privé sous contrat":
      return { statut: "privé", statutDetail: "sous contrat" };
    default:
      logger.error(`Statut d'établissement "${statut}" inconnu`);
      return { statut: null, statutDetail: null };
  }
}

function formatUrl(url) {
  if (!url) {
    return null;
  }

  const urlTrimed = url.trim();
  if (!urlTrimed.match(/^http(s)?:\/\//)) {
    return "https://" + urlTrimed;
  }
  return urlTrimed;
}

export async function importEtablissements() {
  logger.info(`Importation des établissements`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const transform = transformation("EPSG:2154", "EPSG:4326");

  await oleoduc(
    await AcceEtablissementRepository.find({
      // Filtre les établissement qui nous intéressent (lycée, CFA ...)
      nature_uai: { $regex: /^[2345678]/ },
    }),
    transformData((data) => {
      return {
        data,
        formated: {
          uai: data.numero_uai,
          libelle: data.appellation_officielle,
          // TODO: format url
          url: formatUrl(data.site_web),
          ...formatStatutEtablissement(data.secteur_public_prive_libe),
          address: {
            street: data.adresse_uai,
            postCode: data.code_postal_uai,
            city: data.commune_libe,
            cedex: /cedex/i.test(data.localite_acheminement_uai),
          },
        },
      };
    }),
    // Ajout des donnéezs de l'onisep
    transformData(
      async ({ data, formated }) => {
        const onisepEtab = await OnisepRaw.first({
          type: "ideoStructuresEnseignementSecondaire",
          "data.code_uai": formated.uai,
        });

        const onisepFormated = {
          ...(onisepEtab ? formatStatutEtablissement(onisepEtab.data.statut) : {}),
        };
        if (onisepEtab) {
          const idOnisep = onisepEtab.data.url_et_id_onisep
            ? get(onisepEtab.data.url_et_id_onisep.match(/ENS\.[0-9]+/), "0", null)
            : null;
          onisepFormated["onisep"] = {
            id: idOnisep,
          };

          // Utilisation du libelle onisep de préférence
          if (onisepEtab.data.nom) {
            onisepFormated["libelle"] = onisepEtab.data.nom;
          }

          if (!formated.url) {
            onisepFormated["url"] = `https://www.onisep.fr/http/redirection/etablissement/slug/${idOnisep}`;
          }

          const jPO = parseJourneesPortesOuvertes(onisepEtab.data.journees_portes_ouvertes);
          if (jPO) {
            onisepFormated["journeesPortesOuvertes"] = jPO;
          }

          // Some data are only available on ideo formation (TODO: demander à l'Onisep d'ajouter ces data dans l'idéo structure)
          const onisepFormation = await OnisepRaw.first({
            type: "ideoActionsFormationInitialeUniversLycee",
            "data.ens_code_uai": formated.uai,
          });
          if (onisepFormation) {
            onisepFormated["url"] = onisepFormation.data.ens_site_web;
          }
        }

        return {
          data,
          formated: { ...formated, ...onisepFormated },
        };
      },
      { parallel: 10 }
    ),
    // Transform coordinate
    transformData(({ data, formated }) => {
      const coordinate =
        data.coordonnee_x && data.coordonnee_y
          ? transform.forward({ x: parseFloat(data.coordonnee_x), y: parseFloat(data.coordonnee_y) })
          : null;

      return {
        data,
        formated: {
          ...formated,
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
        },
      };
    }),
    writeData(
      async ({ data, formated }) => {
        stats.total++;

        try {
          const res = await upsert(
            etablissement(),
            {
              uai: formated.uai,
            },
            {
              $setOnInsert: {
                "_meta.date_import": new Date(),
                "_meta.created_on": new Date(),
                "_meta.updated_on": new Date(),
              },
              $set: omitNil({
                ...formated,
                address: omitNil(formated.address),
              }),
            }
          );

          if (res.upsertedCount) {
            logger.info(`Nouveau établissement ${formated.uai} ajouté`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Etablissement ${formated.uai} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Etablissement ${formated.uai} déjà à jour`);
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
