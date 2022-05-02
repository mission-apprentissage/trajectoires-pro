require("dotenv").config();
const server = require("./http/server");
const logger = require("./common/logger");
const { connectToMongodb, configureValidation } = require("./common/mongodb");

process.on("unhandledRejection", (e) => logger.error(e, "An unexpected error occurred"));
process.on("uncaughtException", (e) => logger.error(e, "An unexpected error occurred"));

(async function () {
  await connectToMongodb();
  await configureValidation();

  const http = await server();
  http.listen(5000, () => logger.info(`Server ready and listening on port ${5000}`));
})();
