import "dotenv/config";
import { program as cli } from "commander";
import { createWriteStream } from "fs";
import { runScript } from "./common/runScript.js";
import { writeToStdout } from "oleoduc";
import { exportCodeCertifications } from "./jobs/exportCodeCertifications.js";
import { importBCN } from "./jobs/importBCN.js";
import { importStats } from "./jobs/importStats.js";
import { backfillMetrics } from "./jobs/backfillMetrics.js";
import { asArray } from "./common/utils/stringUtils.js";

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(() => {
      return importBCN();
    });
  });

cli
  .command("importStats")
  .description("Importe les données statistiques de l'API InserJeunes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications,regionales)", asArray)
  .action((stats) => {
    runScript(() => {
      return importStats({ stats });
    });
  });

cli
  .command("exportCodeCertifications")
  .description("Permet de savoir si des codes certifications sont fermés")
  .option("--out [out]", "Fichier cible dans lequel sera stocké l'export (defaut: stdout)", createWriteStream)
  .action(({ out }) => {
    runScript(async () => {
      const output = out || writeToStdout();

      await exportCodeCertifications(output);
    });
  });

cli
  .command("backfillMetrics")
  .description("Backfill les metrics (champs codes_certifications et regions)")
  .action((options) => {
    runScript(() => {
      return backfillMetrics(options);
    });
  });

cli.parse(process.argv);
