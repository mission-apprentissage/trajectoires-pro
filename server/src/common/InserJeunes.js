const { filterData, accumulateData, compose, flattenArray } = require("oleoduc");
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

class InserJeunes {
  constructor(options = {}) {
    this.api = options.api || new InserJeunesApi();
  }

  async getFormationsStats(uai, millesime) {
    const httpStream = await this.api.fetchEtablissementStats(uai, millesime);

    return compose(
      httpStream,
      streamNestedJsonArray("data"),
      filterFormationStats(),
      groupByFormation(uai, millesime),
      flattenArray()
    );
  }
}

module.exports = InserJeunes;