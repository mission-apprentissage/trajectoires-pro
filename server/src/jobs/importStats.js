import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import { importFormationsStats } from "./importFormationsStats.js";
import { importCertificationsStats } from "./importCertificationsStats.js";
import { computeRegionalesStats } from "./computeRegionalesStats.js";
import { computeDepartementalesStats } from "./computeDepartementalesStats.js";

export async function importStats(options = {}) {
  let stats = options.stats || ["certifications", "formations", "regionales", "departementales"];

  const inserjeunesOptions = { apiOptions: { retry: { retries: 5 } } };
  const inserjeunes = new InserJeunes(inserjeunesOptions); //Permet de partager le rate limiter entre les deux imports
  await inserjeunes.login();

  const results = await promiseAllProps({
    ...(stats.includes("certifications") ? { certifications: importCertificationsStats({ inserjeunes }) } : {}),
    ...(stats.includes("formations") ? { formations: importFormationsStats({ inserjeunes }) } : {}),
  });

  return promiseAllProps({
    ...results,
    ...(stats.includes("regionales") ? { regionales: await computeRegionalesStats() } : {}),
    ...(stats.includes("departementales") ? { departementales: await computeDepartementalesStats() } : {}),
  });
}
