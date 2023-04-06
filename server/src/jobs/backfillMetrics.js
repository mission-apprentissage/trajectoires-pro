import { oleoduc, writeData } from "oleoduc";
import { omitBy, pickBy, isEmpty, pick, isNil, isArray } from "lodash-es";
import Url from "url";
import express from "express";

import { metrics as metricsCollection } from "../common/db/collections/collections.js";
import { getLoggerWithContext } from "../common/logger.js";
import certificationsRoutes from "../http/routes/certificationsRoutes.js";
import regionalesRoutes from "../http/routes/regionalesRoutes.js";
import formationsRoutes from "../http/routes/formationsRoutes.js";

import { buildMetrics } from "../http/middlewares/metricsMiddleware.js";

const logger = getLoggerWithContext("import");

function queryMetrics() {
  return metricsCollection().find({}).stream();
}

export async function backfillMetrics() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const app = express();
  const router = express.Router();
  const appRoute = express();
  appRoute.use(certificationsRoutes());
  appRoute.use(regionalesRoutes());
  appRoute.use(formationsRoutes());

  appRoute._router.stack.forEach((list) => {
    if (list.name === "router") {
      list.handle.stack.forEach((route) => {
        logger.info(`Create temporary routes ${route.route.path}`);
        router.get(route.route.path, async (req, res) => {
          const metrics = pick(buildMetrics(req), "codes_certifications", "code_certification", "regions");
          const result = await metricsCollection().updateOne(
            { _id: req._id },
            {
              $set: omitBy(
                {
                  ...metrics,
                },
                (metric) => isNil(metric) || (isArray(metric) && isEmpty(metric))
              ),
              $unset: pickBy({ ...metrics }, (metric) => isNil(metric) || (isArray(metric) && isEmpty(metric))),
            }
          );

          if (result.modifiedCount) {
            stats.updated++;
            logger.info("Metrics mise à jour", req._id, req.url);
          }
          res.end();
        });
      });
    }
  });
  router.get("*", function (req, res) {
    res.end();
  });

  app.use(router);
  await oleoduc(
    queryMetrics(),
    writeData(
      async (data) => {
        const { url, _id } = data;
        const reqData = new Url.URL(url, "https://trajectoires-pro.apprentissage.beta.gouv.fr/");

        try {
          await new Promise((resolve) => {
            router.handle(
              {
                _id,
                url: reqData.pathname,
                method: "GET",
                query: Object.fromEntries(reqData.searchParams),
                headers: {},
              },
              { end: resolve }
            );
          });
        } catch (err) {
          logger.error(err);
        }

        return null;
      },
      { parallel: 10 }
    )
  );

  return stats;
}
