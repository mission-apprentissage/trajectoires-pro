export function formatMillesime(millesime = "") {
  return millesime.split(/-|_/).sort().join("_");
}
