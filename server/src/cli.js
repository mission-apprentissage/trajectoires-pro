require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");
const migrate = require("./jobs/migrate");
const importInsertJeunes = require("./jobs/importInsertJeunes");
const { createReadStream } = require("fs");

cli
  .command("importInsertJeunes")
  .description("Importe les fichiers InsertJeunes en base")
  .argument("[file]", "Un fichier CSV contenant les informations InsertJeunes", createReadStream)
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
