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
  const stats = options.stats || ["certifications", "formations", "regionales"];
  const millesimes = options.millesimes || null;
  const millesimesDouble = millesimes ? millesimes.map((m) => `${m - 1}_${m}`) : null;

  const inserjeunesOptions = { apiOptions: { retry: { retries: 5 } } };
  const inserjeunes = new InserJeunes(inserjeunesOptions); //Permet de partager le rate limiter entre les deux imports
  await inserjeunes.login();

  return {
    ...(stats.includes("certifications")
      ? { certifications: await importCertificationsStats({ inserjeunes, millesimes }) }
      : {}),
    ...(stats.includes("formations")
      ? { formations: await importFormationsStats({ inserjeunes, millesimes: millesimesDouble }) }
      : {}),
    ...(stats.includes("regionales")
      ? { regionales: await importRegionalesStats({ inserjeunes, millesimes: millesimesDouble }) }
      : {}),
  };
}

export async function importSupStats(options = {}) {
  const stats = options.stats || ["certifications", "formations"];
  const millesimes = options.millesimes || null;
  const millesimesDouble = millesimes ? millesimes.map((m) => `${m - 1}_${m}`) : null;

  const insersupOptions = { apiOptions: { retry: { retries: 5 } } };
  const insersupData = new InserSupData(insersupOptions); //Permet de partager le rate limiter entre les deux imports
  const insersupApi = new InserSupApi(insersupOptions);

  return promiseAllProps({
    ...(stats.includes("certifications")
      ? { certifications: importCertificationsSupStats({ insersup: insersupData, millesimes }) }
      : {}),
    ...(stats.includes("formations")
      ? { formations: importFormationsSupStats({ insersup: insersupApi, millesimes: millesimesDouble }) }
      : {}),
  });
}
