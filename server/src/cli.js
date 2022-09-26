import "dotenv/config";
import { program as cli } from "commander";
import { createWriteStream } from "fs";
import { runScript } from "./common/runScript.js";
import { migrate } from "./jobs/migrate.js";
import { writeToStdout } from "oleoduc";
import { exportCodeCertifications } from "./jobs/exportCodeCertifications.js";
import { importBCN } from "./jobs/importBCN.js";
import { importStats } from "./jobs/importStats.js";
import { asArray } from "./common/utils/stringUtils.js";
import { exportMetabaseQueries, runMetabaseQuery } from "./common/metabase.js";
import { getDirname } from "./common/utils/esmUtils.js";
import path from "path";

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
  .argument("[stats]", "Le nom des stats à importer (formations,certifications)", asArray)
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
  .command("metabase [type] [queryName]")
  .description("Permet de lancer ou exporter les requêtes Metabase")
  .option("--out [out]", "Le répertoire cible dans lequel seront stockés les fichiers exportés (defaut: .local)")
  .action((type, queryName, { out }) => {
    runScript(() => {
      if (queryName) {
        return runMetabaseQuery(type, queryName);
      } else {
        const output = out || path.join(getDirname(import.meta.url), "..", ".local");
        return exportMetabaseQueries(output);
      }
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
