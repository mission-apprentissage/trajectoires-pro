import express from "express";
import bodyParser from "body-parser";
import config from "../config.js";
import { logger } from "../common/logger.js";
import mongoSanitize from "express-mongo-sanitize";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { tryCatch } from "./middlewares/tryCatchMiddleware.js";
import { corsMiddleware } from "./middlewares/corsMiddleware.js";
import { dbCollection } from "../common/db/mongodb.js";
import formationsRoutes from "./routes/formationsRoutes.js";
import certificationsRoutes from "./routes/certificationsRoutes.js";
import swaggerRoutes from "./routes/swaggerRoutes.js";
import { packageJson } from "../common/utils/esmUtils.js";

export default async () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(mongoSanitize({ replaceWith: "_" }));
  app.use(corsMiddleware());
  app.use(logMiddleware());
  app.use(certificationsRoutes());
  app.use(formationsRoutes());
  app.use(swaggerRoutes());

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
