require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");
const migrate = require("./jobs/migrate");

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
