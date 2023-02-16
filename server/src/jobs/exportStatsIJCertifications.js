import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { InserJeunesApi } from "../common/inserjeunes/InserJeunesApi.js";
import { oleoduc, transformData } from "oleoduc";
import { getLoggerWithContext } from "../common/logger.js";

const logger = getLoggerWithContext("export");

export async function exportStatsIJCertifications(options = {}) {
  const folderPath = options.folderPath;
  const ijApi = options.inserjeunes || new InserJeunesApi();
  const millesimes = options.millesimes || ["2019", "2020", "2021"];
  const filieres = options.filieres || ["apprentissage", "voie_pro_sco_educ_nat"];

  const handleError = (e, context = {}) => {
    logger.error({ err: e, ...context }, `Impossible d'exporter les stats pour la certification`);
    return null;
  };

  const params = millesimes.flatMap((millesime) => {
    return filieres.map((filiere) => ({ millesime, filiere }));
  });

  await oleoduc(
    Readable.from(params),
    transformData(
      async (params) => {
        const { millesime, filiere } = params;
        const filePath = path.resolve(folderPath, `${millesime}_${filiere}.json`);
        try {
          await oleoduc(await ijApi.fetchCertificationStats(millesime, filiere), fs.createWriteStream(filePath));
          logger.info("Certifications exportée", { filiere, millesime });
        } catch (err) {
          handleError(err, params);
        }
      },
      { parallel: 4 }
    )
  );
}
