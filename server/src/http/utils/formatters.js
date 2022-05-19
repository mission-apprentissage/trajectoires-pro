// @ts-check

/**
 * Format millesime value, eg: "2020-2019" => "2019_2020"
 *
 * @param {string} millesime
 * @returns {string}
 */
export function formatMillesime(millesime = "") {
  return millesime.split(/-|_/).sort().join("_");
}
