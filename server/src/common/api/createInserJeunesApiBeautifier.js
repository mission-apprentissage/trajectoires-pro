const { oleoduc, filterData, accumulateData, writeData } = require("oleoduc");
const InsertJeunesApi = require("./InserJeunesApi");
const { streamNestedJsonArray } = require("../utils/streamUtils");

function getType(dimension) {
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

function groupByFormation(millesime) {
  return accumulateData(
    (acc, stats) => {
      const dimension = stats.dimensions[0];
      const codeFormation = getCodeFormation(dimension);

      const index = acc.findIndex((item) => item.code_formation === codeFormation);

      if (index === -1) {
        acc.push({
          code_formation: codeFormation,
          millesime,
          type: getType(dimension),
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

module.exports = (options = {}) => {
  const api = options.api || new InsertJeunesApi();

  async function getFormationsStats(uai, millesime) {
    const httpStream = await api.fetchEtablissementStats(uai, millesime);

    let result;
    await oleoduc(
      httpStream,
      streamNestedJsonArray("data"),
      filterFormationStats(),
      groupByFormation(millesime),
      writeData((data) => {
        result = data;
      })
    );

    return result;
  }

  return {
    getFormationsStats,
  };
};