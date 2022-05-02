const express = require("express");
const config = require("../config");
const logger = require("../common/logger");
const bodyParser = require("body-parser");
const logMiddleware = require("./middlewares/logMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");
const tryCatch = require("./middlewares/tryCatchMiddleware");
const corsMiddleware = require("./middlewares/corsMiddleware");
const packageJson = require("../../package.json");
const hello = require("./routes/helloRoutes");
const { dbCollection } = require("../common/mongodb");
const svg = require("./routes/svgRoutes");

module.exports = async () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(corsMiddleware());
  app.use(logMiddleware());
  app.use(hello());
  app.use(svg());

  app.get(
    "/api",
    tryCatch(async (req, res) => {
      let mongodbStatus;

      await dbCollection("logs")
        .stats()
        .then(() => {
          mongodbStatus = true;
        })
        .catch((e) => {
          mongodbStatus = false;
          logger.error("Healthcheck failed", e);
        });

      return res.json({
        version: packageJson.version,
        env: config.env,
        healthcheck: {
          mongodb: mongodbStatus,
        },
      });
    })
  );

  app.use(errorMiddleware());

  return app;
};
