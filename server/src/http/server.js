import express from "express";
import bodyParser from "body-parser";
import config from "#src/config.js";
import { logger } from "#src/common/logger.js";
import mongoSanitize from "express-mongo-sanitize";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { tryCatch } from "./middlewares/tryCatchMiddleware.js";
import { corsMiddleware } from "./middlewares/corsMiddleware.js";
import { dbCollection } from "#src/common/db/mongodb.js";
import certificationsRoutes from "./routes/certificationsRoutes.js";
import regionalesRoutes from "./routes/regionalesRoutes.js";
import formationsRoutes from "./routes/formationsRoutes.js";
import bcnRoutes from "./routes/bcnRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import swaggerRoutes from "./routes/swaggerRoutes.js";
import { packageJson } from "#src/common/utils/esmUtils.js";

export default async () => {
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(mongoSanitize({ replaceWith: "_" }));
  app.use(corsMiddleware());
  app.use(logMiddleware());
  app.use(certificationsRoutes());
  app.use(regionalesRoutes());
  app.use(formationsRoutes());
  app.use(bcnRoutes());
  app.use(swaggerRoutes());
  app.use(authRoutes());

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
