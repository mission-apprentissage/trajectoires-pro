import fs from "fs";
import path from "path";
import { InserJeunesApi } from "../common/inserjeunes/InserJeunesApi.js";
import { promiseAllProps } from "../common/utils/asyncUtils.js";

import { exportStatsIJCertifications } from "./exportStatsIJCertifications.js";
import { exportStatsIJEtablissements } from "./exportStatsIJEtablissements.js";

export async function exportStatsInserJeunes(options = {}) {
  const { stats, folder } = options;
  const folderPath = path.resolve(process.cwd(), folder);

  const folderStat = await fs.promises.stat(folderPath);
  if (!folderStat.isDirectory()) {
    throw new Error(`${folder} n'est pas un dossier`);
  }

  const inserjeunes = new InserJeunesApi();
  await inserjeunes.login();

  return promiseAllProps({
    ...(stats.includes("certifications")
      ? { certifications: exportStatsIJCertifications({ folderPath, inserjeunes }) }
      : {}),
    ...(stats.includes("etablissements")
      ? { etablissements: exportStatsIJEtablissements({ folderPath, inserjeunes }) }
      : {}),
  });
}
