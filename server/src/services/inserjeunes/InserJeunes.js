import { transformData, filterData, accumulateData, flattenArray, oleoduc, writeData } from "oleoduc";

import { InserJeunesApi } from "./InserJeunesApi.js";
import { streamNestedJsonArray } from "#src/common/utils/streamUtils.js";

function getFiliereFromIDType(dimension) {
  return dimension["id_formation_apprentissage"] ? "apprentissage" : "pro";
}

function getFiliere(filiere) {
  switch (filiere) {
    case "voie_pro_sco_educ_nat":
      return "pro";
    case "voie_pro_sco_agri":
      return "agricole";
    case "apprentissage":
      return "apprentissage";
    default:
      throw new Error(`Filiere ${filiere} inconnue`);
  }
}

function getCodeCertification(dimension) {
  return dimension["id_formation_apprentissage"] || dimension["id_mefstat11"];
}

function filterFormationStats() {
  return filterData((data) => {
    return data.dimensions.filter(getCodeCertification).length > 0;
  });
}

function groupByCertification(additionalData = {}) {
  return accumulateData(
    (acc, stats) => {
      const dimension = stats.dimensions[0];
      const filiere = stats.filiere ? getFiliere(stats.filiere) : getFiliereFromIDType(dimension);
      const code = getCodeCertification(dimension);

      const index = acc.findIndex((item) => item.code_certification === code && item.filiere === filiere);

      if (index === -1) {
        acc.push({
          ...additionalData,
          filiere: filiere,
          code_certification: code,
          [stats.id_mesure]: stats.valeur_mesure,
        });
      } else {
        acc[index][stats.id_mesure] = stats.valeur_mesure;
      }

      return acc;
    },
    { accumulator: [] }
  );
}

function computeMissingStats() {
  return transformData((data) => {
    const {
      nb_annee_term,
      nb_sortant,
      nb_poursuite_etudes,
      nb_en_emploi_24_mois,
      nb_en_emploi_18_mois,
      nb_en_emploi_12_mois,
      nb_en_emploi_6_mois,
    } = data;

    if (nb_annee_term === undefined || (nb_sortant === undefined && nb_poursuite_etudes === undefined)) {
      return data;
    }

    return {
      ...data,
      // On ne calcul pas le nb_poursuite_etudes, il peut y avoir des sortant pas pris en compte dans nb_sortant
      //nb_poursuite_etudes: nb_poursuite_etudes === undefined ? nb_annee_term - nb_sortant : nb_poursuite_etudes,
      nb_en_emploi_24_mois: !nb_en_emploi_24_mois && nb_poursuite_etudes === nb_annee_term ? 0 : nb_en_emploi_24_mois,
      nb_en_emploi_18_mois: !nb_en_emploi_18_mois && nb_poursuite_etudes === nb_annee_term ? 0 : nb_en_emploi_18_mois,
      nb_en_emploi_12_mois: !nb_en_emploi_12_mois && nb_poursuite_etudes === nb_annee_term ? 0 : nb_en_emploi_12_mois,
      nb_en_emploi_6_mois: !nb_en_emploi_6_mois && nb_poursuite_etudes === nb_annee_term ? 0 : nb_en_emploi_6_mois,
      nb_sortant: nb_sortant === undefined ? nb_annee_term - nb_poursuite_etudes : nb_sortant,
    };
  });
}

function renameStats() {
  return transformData((data) => {
    const statsToRename = {
      salaire_TS_Q1_12_mois: "salaire_12_mois_q1",
      salaire_TS_Q2_12_mois: "salaire_12_mois_q2",
      salaire_TS_Q3_12_mois: "salaire_12_mois_q3",
    };

    return {
      ...data,
      ...Object.fromEntries(
        Object.entries(data)
          .filter(([k]) => statsToRename[k])
          .map(([k, d]) => [statsToRename[k], d])
      ),
    };
  });
}

async function transformApiStats(statsFromApi, groupBy) {
  let stats = [];
  await oleoduc(
    statsFromApi,
    streamNestedJsonArray("data"),
    filterFormationStats(),
    groupBy,
    flattenArray(),
    computeMissingStats(),
    renameStats(),
    writeData((data) => {
      stats.push(data);
    })
  );

  return stats;
}

class InserJeunes {
  constructor(options = {}) {
    this.api = options.api || new InserJeunesApi(options.apiOptions || {});
  }
  async login() {
    return this.api.login();
  }

  async getFormationsStats(uai, millesime) {
    const etablissementsStats = await this.api.fetchEtablissementStats(uai, millesime);

    return await transformApiStats(etablissementsStats, groupByCertification({ uai, millesime }));
  }

  async getRegionalesStats(millesime, code_region_academique) {
    // l'API IJ renvoi un JSON dans un JSON sauf sur la route regionale
    // stringify le JSON reçu pour être cohérent avec les autres routes
    const regionalesStats = await this.api.fetchRegionalesStats(millesime, code_region_academique);

    return await transformApiStats(regionalesStats, groupByCertification({ millesime }));
  }

  async getCertificationsStats(millesime, filiere) {
    const certificationsStats = await this.api.fetchCertificationStats(millesime, filiere);

    return await transformApiStats(certificationsStats, groupByCertification({ millesime }));
  }
}

export { InserJeunes };
