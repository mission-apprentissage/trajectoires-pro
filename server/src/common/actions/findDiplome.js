import { findCodeCertification } from "./findCodeCertification.js";

export async function findDiplome(code) {
  const certif = await findCodeCertification(code);

  return certif?.diplome;
}
