import { InserJeunes } from "#src/services/inserjeunes/InserJeunes.js";
import { promiseAllProps } from "#src/common/utils/asyncUtils.js";
import { importFormationsStats } from "./importFormationsStats.js";
import { importFormationsSupStats } from "./importFormationsSupStats.js";
import { importCertificationsStats } from "./importCertificationsStats.js";
import { importCertificationsSupStats } from "./importCertificationsSupStats.js";
import { importRegionalesStats } from "./importRegionalesStats.js";
import { InserSup as InserSupData } from "#src/services/dataEnseignementSup/InserSup.js";
import { InserSupApi } from "#src/services/insersup/InsersupApi.js";

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

export async function importSupStats(options = {}) {
  let stats = options.stats || ["certifications", "formations"];
  let millesimes = options.millesimes || null;

  const insersupOptions = { apiOptions: { retry: { retries: 5 } } };
  const insersupData = new InserSupData(insersupOptions); //Permet de partager le rate limiter entre les deux imports
  const insersupApi = new InserSupApi(insersupOptions);

  return promiseAllProps({
    ...(stats.includes("certifications")
      ? { certifications: importCertificationsSupStats({ insersup: insersupData, millesimes }) }
      : {}),
    ...(stats.includes("formations")
      ? { formations: importFormationsSupStats({ insersup: insersupApi, millesimes }) }
      : {}),
  });
}
