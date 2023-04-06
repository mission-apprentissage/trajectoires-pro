export function formatMillesime(millesime = "") {
  return millesime.split(/-|_/).sort().join("_");
}

export function formatArrayParameters(value) {
  return value.split ? value.split(/,|\|/) : [value];
}
