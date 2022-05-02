require("dotenv").config();
const server = require("./http/server");
const logger = require("./common/logger");
const config = require("./config");
const { connectToMongodb } = require("./common/mongodb");

process.on("unhandledRejection", (e) => logger.error("An unexpected error occurred", e));
process.on("uncaughtException", (e) => logger.error("An unexpected error occurred", e));

(async function () {
  await connectToMongodb();
  const http = await server();
  http.listen(5000, () => logger.info(`${config.appName} - Server ready and listening on port ${5000}`));
})();
