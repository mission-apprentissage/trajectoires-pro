import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import { regionStats } from "../../common/db/collections/collections.js";
import { addCsvHeaders, addJsonHeaders, sendStats } from "../utils/responseUtils.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import Boom from "boom";
import { getCFDStats, sendCFDStats } from "../../common/stats/cfd.js";
import { findCodeFormationDiplome } from "../../common/bcn.js";
import { convertStatsNames } from "../../common/stats/statsNames.js";

export default () => {
  const router = express.Router();

  async function sendRegionStats({ find, pagination }, res, options = {}) {
    let extensionTransformer;
    if (options.ext === "csv") {
      addCsvHeaders(res);
      extensionTransformer = transformIntoCSV({
        columns: {
          region: (f) => f.region.nom,
          code_certification: (f) => f.code_certification,
          filiere: (f) => f.filiere,
          millesime: (f) => f.millesime,
          ...convertStatsNames({}, (statName) => (f) => f[statName]),
        },
      });
    } else {
      addJsonHeaders(res);
      extensionTransformer = transformIntoJSON({
        arrayPropertyName: "regionales",
        arrayWrapper: {
          pagination,
        },
      });
    }

    return compose(find.stream(), extensionTransformer, res);
  }

  router.get(
    "/api/inserjeunes/regionales.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.statsList(),
        }
      );

      const paginable = await findAndPaginate(
        regionStats(),
        {
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes.map(formatMillesime) } } : {}),
          ...(code_certifications.length > 0 ? { code_certification: { $in: code_certifications } } : {}),
        },
        {
          limit: items_par_page,
          page,
          projection: { _id: 0, _meta: 0 },
        }
      );

      return sendRegionStats(paginable, res, rest);
    })
  );

  router.get(
    "/api/inserjeunes/regionales/:region.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { region, millesimes, code_certifications, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.region(),
          ...validators.statsList(),
        }
      );

      const paginable = await findAndPaginate(
        regionStats(),
        {
          "region.code": region,
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes.map(formatMillesime) } } : {}),
          ...(code_certifications.length > 0 ? { code_certification: { $in: code_certifications } } : {}),
        },
        {
          limit: items_par_page,
          page,
          projection: { _id: 0, _meta: 0 },
        }
      );

      return sendRegionStats(paginable, res, rest);
    })
  );

  router.get(
    "/api/inserjeunes/regionales/:region/certifications/:code_certification.:ext?",
    tryCatch(async (req, res) => {
      const { region, code_certification, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.region(),
          code_certification: Joi.string().required(),
          millesime: Joi.string(),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "cfd") {
        const cfd = await findCodeFormationDiplome(code_certification);
        const cfdStats = await getCFDStats(cfd, millesime);
        return sendCFDStats(cfdStats, res, options);
      }

      const results = await regionStats()
        .find(
          { "region.code": region, code_certification, ...(millesime ? { millesime } : {}) },
          { projection: { _id: 0, _meta: 0 } }
        )
        .limit(1)
        .sort({ millesime: -1 })
        .toArray();

      if (results.length === 0) {
        throw Boom.notFound("Pas de données disponibles");
      }

      const stats = results[0];
      return sendStats(stats, res, options);
    })
  );

  return router;
};
