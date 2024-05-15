import { CODE_CERTIFICATION_PATTERNS } from "./validators.js";

export function formatMillesime(millesime = "") {
  return millesime.split(/-|_/).sort().join("_");
}

export function formatArrayParameters(value) {
  return value.split ? value.split(/,|\|/) : [value];
}

export function formatCodeCertification(code_certification) {
  const match = CODE_CERTIFICATION_PATTERNS.map((code_certification_pattern) => {
    return code_certification.match(code_certification_pattern);
  }).find((m) => m);

  if (!match) {
    throw new Error("Invalid code_certification");
  }
  return match[1];
}

export function formatCodesCertifications(codes_certifications) {
  return codes_certifications.map((code_certification) => formatCodeCertification(code_certification));
}
