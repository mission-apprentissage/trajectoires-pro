import { oleoduc, writeData, transformData, mergeStreams, compose, filterData } from "oleoduc";
import streamToArray from "stream-to-array";
import { getLoggerWithContext } from "#src/common/logger.js";
import BCNMefRepository from "#src/common/repositories/bcnMef.js";
import OnisepRawRepository from "#src/common/repositories/onisepRaw.js";
import BCNRepository from "#src/common/repositories/bcn.js";

const logger = getLoggerWithContext("import");

async function getCfd(idOnisep, urlOnisep) {
  const formationInitiale = await OnisepRawRepository.first({
    type: "ideoFormationsInitiales",
    "data.url_et_id_onisep": urlOnisep,
  });

  if (!formationInitiale) {
    logger.error(`Pas de correspondance pour l'id de formation ${idOnisep}`);
    return null;
  }

  if (!formationInitiale?.data?.code_scolarite) {
    logger.error(`Pas de CFD pour l'id de formation ${idOnisep}`);
    return null;
  }

  // TODO : ajout de la table de passage des CARIF OREF

  return formationInitiale.data.code_scolarite;
}

function getDuree(data) {
  const DUREES = {
    "1 an": "1",
    "2 ans": "2",
    "3 ans": "3",
    "4 ans": "4",
  };

  const duree = DUREES[data?.af_duree_cycle_standard];
  if (!duree) {
    return null;
  }

  return duree;
}

async function getBcn(cfd, duree) {
  const bcn = await BCNRepository.first({ code_certification: cfd });
  const bcnMef = await streamToArray(
    await BCNMefRepository.find({
      formation_diplome: cfd,
      duree_dispositif: duree,
      annee_dispositif: duree,
    })
  );

  if (!bcn && !bcnMef) {
    logger.error(`Formation ${cfd} inconnu dans la BCN`);
    return {};
  }

  if (bcnMef.length > 1) {
    logger.error(`Plusieurs MEF corespondent à la formation cfd : ${cfd}, durée : ${duree} ans`);
    return {};
  }

  return { bcn, bcnMef };
}

export async function streamOnisepFormations({ stats }) {
  const FOR_TYPES = [
    "CAP",
    "CAP agricole",
    "baccalauréat professionnel",
    "brevet de technicien",
    "brevet professionnel agricole",
    "brevet professionnel de la jeunesse, de l'éducation populaire et du sport",
    "certificat technique des métiers",
    "classe de 2de professionnelle",
    "diplôme professionnel de l'animation et du sport",
  ];

  return compose(
    await OnisepRawRepository.find({
      type: "ideoActionsFormationInitialeUniversLycee",
      "data.for_type": { $in: FOR_TYPES },
    }),

    transformData(async (data) => {
      stats.total++;

      const urlOnisep = data.data.for_url_et_id_onisep;
      const idOnisep = urlOnisep.match(/FOR\.[0-9]+/)[0];

      const cfd = await getCfd(idOnisep, urlOnisep);
      if (!cfd) {
        stats.failed++;
        return null;
      }

      const duree = getDuree(data.data);
      if (!duree) {
        stats.failed++;
        logger.error(
          `Durée de formation (${data.data.action_de_formation_af_identifiant_onisep}/${idOnisep}) invalide ${data.data.af_duree_cycle_standard}`
        );
        return null;
      }

      const { bcn, bcnMef } = await getBcn(cfd, duree);
      if (!bcn) {
        stats.failed++;
        return null;
      }

      if (!data.data.ens_code_uai) {
        logger.error(`Pas d'uai pour la formation ${data.data.action_de_formation_af_identifiant_onisep}`);
        return null;
      }

      const dataFormatted = {
        uai: data.data.ens_code_uai,
        cfd: cfd,
        codeDispositif: bcnMef && bcnMef[0] ? bcnMef[0].dispositif_formation : "",
        mef11: bcnMef && bcnMef[0] ? bcnMef[0].mef_stat_11 : null,
        voie: "scolaire",
        millesime: [data.millesime],
      };

      return dataFormatted;
    }),
    filterData((data) => data)
  );
}
