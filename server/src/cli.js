require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");
const migrate = require("./jobs/migrate");
const importInsertJeunes = require("./jobs/importInsertJeunes");
const { createReadStream } = require("fs");
const InsertJeunesApi = require("./common/api/InsertJeunesApi");
const { oleoduc, writeData, filterData } = require("oleoduc");
const { difference } = require("lodash");

function asArray(v) {
  return v.split(",");
}

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

cli
  .command("testApi")
  .argument("<uai>", "L'UAI de l'établissement")
  .argument("<millesime>", "Le millesime")
  .option("--dimensions <dimensions>", "Permet de sélectionner une ou plusieurs dimensions", asArray)
  .action((uai, millesime, { dimensions }) => {
    runScript(async () => {
      let api = new InsertJeunesApi();

      await oleoduc(
        await api.statsParEtablissement(uai, millesime),
        filterData((data) => {
          if (!dimensions || dimensions.length === 0) {
            return true;
          }

          let current = data.dimensions.reduce((acc, d) => {
            return [...acc, ...Object.keys(d)];
          }, []);

          return current.length === dimensions.length && difference(dimensions, current).length === 0;
        }),
        writeData((data) => {
          console.log(data);
        })
      );
    });
  });

cli.parse(process.argv);
