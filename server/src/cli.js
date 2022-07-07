import "dotenv/config";
import { program as cli } from "commander";
import { createReadStream, createWriteStream } from "fs";
import { runScript } from "./common/runScript.js";
import { migrate } from "./jobs/migrate.js";
import { writeToStdout } from "oleoduc";
import { exportCodeCertifications } from "./jobs/exportCodeCertifications.js";
import { importBCN } from "./jobs/importBCN.js";
import { importStats } from "./jobs/importStats.js";

function asArray(v) {
  return v.split(",");
}

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
  .argument("[types]", "Le nom des stats à importer (formations,certifications)", asArray, [
    "certifications",
    "regionales",
    "formations",
  ])
  .option(
    "--etablissements",
    "Un fichier CSV avec la liste des etablissements pour lesquels on veut importer les stats",
    createReadStream
  )
  .action((types, options) => {
    runScript(async () => {
      return importStats(types, options);
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
  .command("migrate")
  .description("Execute les scripts de migration")
  .option("--dropIndexes", "Supprime les anciens indexes")
  .action((options) => {
    runScript(() => {
      return migrate(options);
    });
  });

cli.parse(process.argv);
