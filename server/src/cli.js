require("dotenv").config();
const { program: cli } = require("commander");
const runScript = require("./common/runScript");

cli
  .command("sample")
  .description("Example")
  .action(() => {
    runScript(() => {
      console.log("Hello World");
    });
  });

cli.parse(process.argv);
