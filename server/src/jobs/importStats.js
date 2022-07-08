import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import { importFormationsStats } from "./importFormationsStats.js";
import { importCertificationsStats } from "./importCertificationsStats.js";
import { computeRegionStats } from "./computeRegionStats.js";

export async function importStats(stats = []) {
  const inserjeunes = new InserJeunes(); //Permet de partager le rate limiter entre les deux imports
  await inserjeunes.login();

  const results = await promiseAllProps({
    ...(stats.includes("certifications") ? { certifications: importCertificationsStats({ inserjeunes }) } : {}),
    ...(stats.includes("formations") ? { formations: importFormationsStats({ inserjeunes }) } : {}),
  });

  return promiseAllProps({
    ...results,
    ...(stats.includes("regionales") ? { regionales: await computeRegionStats() } : {}),
  });
}
