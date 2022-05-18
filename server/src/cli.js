require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");
const importInserJeunesNationalData = require("./jobs/importInserJeunesNationalData");
const importFormationsStats = require("./jobs/importFormationsStats");
const importCertificationsStats = require("./jobs/importCertificationsStats");
const { createReadStream } = require("fs");
const { promiseAllProps } = require("./common/utils/asyncUtils");
const InserJeunes = require("./common/InserJeunes");

function asArray(v) {
  return v.split(",");
}

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
  .command("importStats")
  .description("Importe les données statistiques de l'API InserJeunes")
  .argument("<stats>", "Le nom des stats à importer (formations,certifications)", asArray, [
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

cli.parse(process.argv);
