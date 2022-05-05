require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");
const importInserJeunesEtablissementsData = require("./jobs/importInserJeunesEtablissementsData");
const importInserJeunesNationalData = require("./jobs/importInserJeunesNationalData");
const { createReadStream } = require("fs");

cli
  .command("importInserJeunesNationalData")
  .description("Importe les données InserJeunes nationales en base")
  .argument("[file]", "Un fichier CSV contenant les données InserJeunes nationales", createReadStream)
  .option("--millesime", "Le millesime du fichier (obligatoire si un fichier est passé en paramètre)")
  .option("--type", "Le type de données: 'apprentissage' ou 'pro' (obligatoire si un fichier est passé en paramètre)")
  .action((file, options = {}) => {
    runScript(() => {
      return importInserJeunesNationalData({ input: file, ...options });
    });
  });

cli
  .command("importInserJeunesEtablissementsData")
  .description("Importe les fichiers InserJeunes des établissements en base")
  .argument("[file]", "Un fichier CSV contenant les données InserJeunes des établissements", createReadStream)
  .option("--millesime", "Le millesime du fichier (obligatoire si un fichier est passé en paramètre)")
  .action((file, options = {}) => {
    runScript(() => {
      return importInserJeunesEtablissementsData({ input: file, ...options });
    });
  });

cli.parse(process.argv);
