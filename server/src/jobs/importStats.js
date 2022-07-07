import { InserJeunes } from "../common/inserjeunes/InserJeunes.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";
import { importFormationsStats } from "./importFormationsStats.js";
import { importCertificationsStats } from "./importCertificationsStats.js";
import { computeRegionStats } from "./computeRegionStats.js";

export async function importStats() {
  const inserjeunes = new InserJeunes(); //Permet de partager le rate limiter entre les deux imports
  await inserjeunes.login();

  const results = promiseAllProps({
    certifications: importCertificationsStats({ inserjeunes }),
    formations: importFormationsStats({ inserjeunes }),
  });

  return {
    ...results,
    regionales: await computeRegionStats(),
  };
}
