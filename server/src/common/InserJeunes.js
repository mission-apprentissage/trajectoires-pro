import { filterData, accumulateData, flattenArray, oleoduc, writeData } from "oleoduc";
import { InserJeunesApi } from "./api/InserJeunesApi.js";
import { streamNestedJsonArray } from "./utils/streamUtils.js";

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

function groupByFormation(uai, millesime) {
  return accumulateData(
    (acc, stats) => {
      const dimension = stats.dimensions[0];
      const code = getCodeCertification(dimension);

      const index = acc.findIndex((item) => item.code_certification === code);

      if (index === -1) {
        acc.push({
          uai,
          code_certification: code,
          millesime,
          filiere: getFiliere(dimension),
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

function groupByCertification(millesime) {
  return accumulateData(
    (acc, stats) => {
      const dimension = stats.dimensions[0];
      const code = getCodeCertification(dimension);
      const index = acc.findIndex((item) => item.code_certification === code);

      if (index === -1) {
        acc.push({
          millesime,
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

class InserJeunes {
  constructor(options = {}) {
    this.api = options.api || new InserJeunesApi();
  }

  async login() {
    return this.api.login();
  }

  async getFormationsStats(uai, millesime) {
    const httpStream = await this.api.fetchEtablissementStats(uai, millesime);

    let stats = [];
    await oleoduc(
      httpStream,
      streamNestedJsonArray("data"),
      filterFormationStats(),
      groupByFormation(uai, millesime),
      flattenArray(),
      writeData((data) => {
        stats.push(data);
      })
    );

    return stats;
  }

  async getCertificationsStats(millesime, filiere) {
    const httpStream = await this.api.fetchCertificationStats(millesime, filiere);

    let stats = [];
    await oleoduc(
      httpStream,
      streamNestedJsonArray("data"),
      filterFormationStats(),
      groupByCertification(millesime, filiere),
      flattenArray(),
      writeData((data) => {
        stats.push(data);
      })
    );

    return stats;
  }
}

export { InserJeunes };
