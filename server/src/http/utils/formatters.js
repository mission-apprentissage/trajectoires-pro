import { CODE_CERTIFICATION_PATTERNS } from "./validators.js";

export function formatMillesime(millesime = "") {
  return millesime.split(/-|_/).sort().join("_");
}

export function formatArrayParameters(value) {
  return value.split ? value.split(/,|\|/) : [value];
}

export function formatCodeCertificationWithType(code_certification) {
  const patternsMatching = CODE_CERTIFICATION_PATTERNS.map(({ type, filiere, pattern }) => {
    const matched = code_certification.match(pattern);
    return {
      type,
      filiere,
      code_certification: matched ? matched[1] : null,
    };
  }).find((m) => m.code_certification);

  if (!patternsMatching) {
    throw new Error("Invalid code_certification");
  }
  return patternsMatching;
}

export function formatCodesCertifications(codes_certifications) {
  return codes_certifications
    .map((code_certification) => formatCodeCertificationWithType(code_certification))
    .map(({ code_certification }) => code_certification);
}
