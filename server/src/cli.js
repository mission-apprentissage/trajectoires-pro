import "dotenv/config";
import { program as cli } from "commander";
import { createReadStream } from "fs";
import { runScript } from "./common/runScript.js";
import { importFormationsStats } from "./jobs/importFormationsStats.js";
import { importCertificationsStats } from "./jobs/importCertificationsStats.js";
import { promiseAllProps } from "./common/utils/asyncUtils.js";
import { InserJeunes } from "./common/InserJeunes.js";
import { importMefs } from "./jobs/importMefs.js";
import { importCfds } from "./jobs/importCfds.js";
import { migrate } from "./jobs/migrate.js";

function asArray(v) {
  return v.split(",");
}

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(() => {
      return promiseAllProps({
        cfd: importCfds(),
        mef: importMefs(),
      });
    });
  });

cli
  .command("importStats")
  .description("Importe les données statistiques de l'API InserJeunes")
  .argument("[stats]", "Le nom des stats à importer (formations,certifications)", asArray, [
    "certifications",
    "formations",
  ])
  .option("--file", "Un fichier CSV avec la liste des UAI dans une colonne ayant pour nom 'uai'", createReadStream)
  .action((stats, { file }) => {
    runScript(async () => {
      const inserjeunes = new InserJeunes(); //Permet de partager le rate limiter entre les deux imports
      await inserjeunes.login();

      return promiseAllProps({
        ...(stats.includes("formations") ? { formations: importFormationsStats({ input: file, inserjeunes }) } : {}),
        ...(stats.includes("certifications") ? { certifications: importCertificationsStats({ inserjeunes }) } : {}),
      });
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
