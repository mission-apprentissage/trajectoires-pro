import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { InserJeunesApi } from "../common/inserjeunes/InserJeunesApi.js";
import { oleoduc, transformData } from "oleoduc";
import { getLoggerWithContext } from "../common/logger.js";
import StreamJSON from "stream-json";
import Stringer from "stream-json/Stringer.js";
import Filter from "stream-json/filters/Filter.js";

import { loadParameters as loadEtablissements } from "./importFormationsStats.js";

const logger = getLoggerWithContext("export");

export async function exportStatsIJEtablissements(options = {}) {
  const folderPath = options.folderPath;
  const ijApi = options.inserjeunes || new InserJeunesApi();

  const etablissements = await loadEtablissements();

  const handleError = (e, context = {}) => {
    logger.error({ err: e, ...context }, `Impossible d'exporter les stats pour la certification`);
    return null;
  };

  await oleoduc(
    Readable.from(etablissements),
    transformData(
      async (params) => {
        const { uai, millesime } = params;
        const filePath = path.resolve(folderPath, `${uai}_${millesime}.json`);
        try {
          await oleoduc(
            await ijApi.fetchEtablissementStats(uai, millesime),
            StreamJSON.parser(),
            // Conserve only data and metadata.UAI
            Filter.filter({ filter: /^(data|metadata\.UAI)/ }),
            Stringer.stringer(),
            fs.createWriteStream(filePath)
          );
          logger.info("Etablissement exporté", { uai, millesime });
        } catch (err) {
          handleError(err, params);
        }
      },
      { parallel: 4 }
    )
  );
}
