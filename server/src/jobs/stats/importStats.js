import { InserJeunes } from "#src/services/inserjeunes/InserJeunes.js";
import { promiseAllProps } from "#src/common/utils/asyncUtils.js";
import { importFormationsStats } from "./importFormationsStats.js";
import { importCertificationsStats } from "./importCertificationsStats.js";
import { importRegionalesStats } from "./importRegionalesStats.js";

export async function importStats(options = {}) {
  let stats = options.stats || ["certifications", "formations", "regionales"];
  let millesimes = options.millesimes || null;

  const inserjeunesOptions = { apiOptions: { retry: { retries: 5 } } };
  const inserjeunes = new InserJeunes(inserjeunesOptions); //Permet de partager le rate limiter entre les deux imports
  await inserjeunes.login();

  return promiseAllProps({
    ...(stats.includes("certifications")
      ? { certifications: importCertificationsStats({ inserjeunes, millesimes }) }
      : {}),
    ...(stats.includes("formations") ? { formations: importFormationsStats({ inserjeunes, millesimes }) } : {}),
    ...(stats.includes("regionales") ? { regionales: importRegionalesStats({ inserjeunes, millesimes }) } : {}),
  });
}
