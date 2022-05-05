require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");
const migrate = require("./jobs/migrate");
const importInsertJeunes = require("./jobs/importInsertJeunes");
const importNationalData = require("./jobs/importNationalData");
const { createReadStream } = require("fs");

cli
  .command("importNationalData")
  .description("Importe les données InserJeunes nationales en base")
  .argument("[file]", "Un fichier CSV contenant les données InserJeunes nationales", createReadStream)
  .option("--millesime", "Le millesime du fichier (obligatoire si un fichier est passé en paramètre)")
  .option("--type", "Le type de données: 'apprentissage' ou 'pro' (obligatoire si un fichier est passé en paramètre)")
  .action((file, options = {}) => {
    runScript(() => {
      return importNationalData({ input: file, ...options });
    });
  });

cli
  .command("importInsertJeunes")
  .description("Importe les fichiers InserJeunes des établissements en base")
  .argument("[file]", "Un fichier CSV contenant les données InserJeunes des établissements", createReadStream)
  .option("--millesime", "Le millesime du fichier (obligatoire si un fichier est passé en paramètre)")
  .action((file, options = {}) => {
    runScript(() => {
      return importInsertJeunes({ input: file, ...options });
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
