// @ts-check

/**
 * Format millesime value, eg: "2020-2019" => "2019_2020"
 *
 * @param {string} millesime
 * @returns {string}
 */
const formatMillesime = (millesime = "") => millesime.split(/-|_/).sort().join("_");

module.exports = {
  formatMillesime,
};
