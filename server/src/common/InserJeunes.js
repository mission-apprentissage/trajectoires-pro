const { filterData, accumulateData, flattenArray, oleoduc, writeData } = require("oleoduc");
const InserJeunesApi = require("./api/InserJeunesApi");
const { streamNestedJsonArray } = require("./utils/streamUtils");

function getFiliere(dimension) {
  return dimension["id_formation_apprentissage"] ? "apprentissage" : "pro";
}

function getCodeFormation(dimension) {
  return dimension["id_formation_apprentissage"] || dimension["id_mefstat11"];
}

function filterFormationStats() {
  return filterData((data) => {
    return data.dimensions.filter(getCodeFormation).length > 0;
  });
}

function groupByFormation(uai, millesime) {
  return accumulateData(
    (acc, stats) => {
      const dimension = stats.dimensions[0];
      const codeFormation = getCodeFormation(dimension);

      const index = acc.findIndex((item) => item.code_formation === codeFormation);

      if (index === -1) {
        acc.push({
          uai,
          code_formation: codeFormation,
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
      const codeFormation = getCodeFormation(dimension);
      const index = acc.findIndex((item) => item.code_formation === codeFormation);

      if (index === -1) {
        acc.push({
          millesime,
          filiere: getFiliere(dimension),
          code_formation: codeFormation,
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

module.exports = InserJeunes;
