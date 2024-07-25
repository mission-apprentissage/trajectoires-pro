import { filterData, oleoduc, writeData } from "oleoduc";
import { pick, omit } from "lodash-es";
import { upsert } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { formation } from "#src/common/db/collections/collections.js";
import { streamCertifInfo } from "#src/services/dataGouv/certifinfo.js";
import OnisepRawRepository from "#src/common/repositories/onisepRaw.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import BCNMefRepository from "#src/common/repositories/bcnMef.js";

const logger = getLoggerWithContext("import");

function formatDomaine(formationInitiale) {
  if (!formationInitiale || !formationInitiale["domainesous-domaine"]) {
    return [];
  }

  const domaines = formationInitiale["domainesous-domaine"].split(" | ");
  return domaines.map((domaine) => {
    const domainePart = domaine.split("/");
    return {
      domaine: domainePart[0],
      sousDomaine: domainePart[1],
    };
  });
}

async function getFormationInitialeWithContinuum(bcn) {
  const { code_formation_diplome } = bcn;

  const formationInitiale = await OnisepRawRepository.first({
    type: "ideoFormationsInitiales",
    "data.code_scolarite": code_formation_diplome,
  });
  if (formationInitiale) {
    return formationInitiale;
  }

  const bcnCfd = await BCNRepository.first({ code_certification: code_formation_diplome });

  // Todo: improve continuum request
  if (bcnCfd.nouveau_diplome.length !== 1) {
    return null;
  }

  const formationInitialeNew = await OnisepRawRepository.first({
    type: "ideoFormationsInitiales",
    "data.code_scolarite": bcnCfd.nouveau_diplome[0],
  });
  return formationInitialeNew;
}

async function importFromBcnAndOnisep() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await BCNRepository.find({ "diplome.code": ["3", "4"] }),
    writeData(
      async (bcn) => {
        const { code_formation_diplome, type, code_certification, libelle_long } = bcn;
        const bcnMef = type === "mef" ? await BCNMefRepository.first({ mef_stat_11: code_certification }) : null;

        const formationInitiale = await getFormationInitialeWithContinuum(bcn);
        const dataFormatted = {
          cfd: code_formation_diplome,
          voie: type === "mef" ? "scolaire" : "apprentissage",
          codeDispositif: bcnMef ? bcnMef.dispositif_formation : null,
          codeDiplome: bcn.diplome.code,
          mef11: bcnMef ? code_certification : null,
          libelle: formationInitiale ? formationInitiale.data.libelle_formation_principal : libelle_long,
          codeRncp: formationInitiale ? formationInitiale.data.code_rncp : null,
          domaines: formatDomaine(formationInitiale?.data),
        };

        try {
          const res = await upsert(formation(), pick(omitNil(dataFormatted), ["cfd", "voie", "codeDispositif"]), {
            $setOnInsert: {
              "_meta.date_import": new Date(),
              "_meta.created_on": new Date(),
              "_meta.updated_on": new Date(),
            },
            $set: omitNil(dataFormatted),
          });

          if (res.upsertedCount) {
            logger.info(`Nouvelle formation ${dataFormatted.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.debug(`Formation ${dataFormatted.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Formation ${dataFormatted.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de la formation ${dataFormatted.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

async function importFromCertifInfo() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await streamCertifInfo(),
    filterData((data) => !!data["Code_Scolarité"]),
    writeData(
      async (data) => {
        const dataFormatted = {
          libelle: data["Libelle_Diplome"],
          cfd: data["Code_Scolarité"],
        };

        try {
          const res = await formation().updateMany(pick(dataFormatted, ["cfd"]), {
            $set: omitNil(omit(dataFormatted, ["cfd"])),
          });

          if (res.modifiedCount) {
            logger.debug(`Formation ${dataFormatted.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Formation ${dataFormatted.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible de mettre à jour les données de la formation ${dataFormatted.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

export async function importFormation() {
  logger.info(`Importation des formations`);

  const statsBcnOnisep = await importFromBcnAndOnisep();
  const statsCertifInfo = await importFromCertifInfo();

  return {
    statsBcnOnisep,
    statsCertifInfo,
  };
}
