import { Readable } from "stream";
import { transformData, filterData, accumulateData, flattenArray, oleoduc, writeData } from "oleoduc";

import { InserJeunesApi } from "./InserJeunesApi.js";
import { streamNestedJsonArray } from "../utils/streamUtils.js";

function getFiliere(dimension) {
  return dimension["id_formation_apprentissage"] ? "apprentissage" : "pro";
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
      const code = getCodeCertification(dimension);

      const index = acc.findIndex((item) => item.code_certification === code);

      if (index === -1) {
        acc.push({
          ...additionalData,
          filiere: getFiliere(dimension),
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
    const { nb_annee_term, nb_sortant, nb_poursuite_etudes } = data;

    if (nb_annee_term === undefined || (nb_sortant === undefined && nb_poursuite_etudes === undefined)) {
      return data;
    }

    return {
      ...data,
      // On ne calcul pas le nb_poursuite_etudes, il peut y avoir des sortant pas pris en compte dans nb_sortant
      //nb_poursuite_etudes: nb_poursuite_etudes === undefined ? nb_annee_term - nb_sortant : nb_poursuite_etudes,
      nb_sortant: nb_sortant === undefined ? nb_annee_term - nb_poursuite_etudes : nb_sortant,
    };
  });
}

async function transformApiStats(statsFromApi, groupBy) {
  let stats = [];
  await oleoduc(
    Readable.from([statsFromApi]),
    streamNestedJsonArray("data"),
    filterFormationStats(),
    groupBy,
    flattenArray(),
    computeMissingStats(),
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

  async getCertificationsStats(millesime, filiere) {
    const certificationsStats = await this.api.fetchCertificationStats(millesime, filiere);

    return await transformApiStats(certificationsStats, groupByCertification({ millesime }));
  }
}

export { InserJeunes };
