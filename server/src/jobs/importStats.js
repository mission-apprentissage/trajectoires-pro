import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import { importFormationsStats } from "./importFormationsStats.js";
import { importCertificationsStats } from "./importCertificationsStats.js";

export async function importStats(options = {}) {
  const { types, etablissements } = options;
  const inserjeunes = new InserJeunes(); //Permet de partager le rate limiter entre les deux imports
  await inserjeunes.login();

  return promiseAllProps({
    ...(types.includes("formations") ? { formations: importFormationsStats({ etablissements, inserjeunes }) } : {}),
    ...(types.includes("certifications") ? { certifications: importCertificationsStats({ inserjeunes }) } : {}),
  });
}
