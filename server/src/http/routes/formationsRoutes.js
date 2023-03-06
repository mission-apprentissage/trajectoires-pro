import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { arrayOf, validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { addCsvHeaders, addJsonHeaders, sendStats } from "../utils/responseUtils.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import Boom from "boom";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { formationsStats } from "../../common/db/collections/collections.js";
import { getStatsAsColumns } from "../../common/utils/csvUtils.js";
import { transformDisplayStat } from "../../common/stats.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/formations.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uais, regions, millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          uais: arrayOf(
            Joi.string()
              .pattern(/^[0-9]{7}[A-Z]{1}$/)
              .required()
          ).default([]),
          ...validators.regions(),
          ...validators.statsList(),
        }
      );

      let { find, pagination } = await findAndPaginate(
        formationsStats(),
        {
          ...(uais.length > 0 ? { uai: { $in: uais } } : {}),
          ...(regions.length > 0 ? { "region.code": { $in: regions } } : {}),
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes.map(formatMillesime) } } : {}),
          ...(code_certifications.length > 0 ? { code_certification: { $in: code_certifications } } : {}),
        },
        {
          limit: items_par_page,
          page,
          projection: { _id: 0, _meta: 0 },
        }
      );

      let extensionTransformer;
      if (ext === "csv") {
        addCsvHeaders(res);
        extensionTransformer = transformIntoCSV({
          columns: {
            uai: (f) => f.uai,
            code_certification: (f) => f.code_certification,
            filiere: (f) => f.filiere,
            millesime: (f) => f.millesime,
            ...getStatsAsColumns(),
          },
          mapper: (v) => (v === null ? "null" : v),
        });
      } else {
        addJsonHeaders(res);
        extensionTransformer = transformIntoJSON({
          arrayPropertyName: "formations",
          arrayWrapper: {
            pagination,
          },
        });
      }

      compose(find.stream(), transformDisplayStat(true), extensionTransformer, res);
    })
  );

  router.get(
    "/api/inserjeunes/formations/:uai-:code_certification.:ext?",
    tryCatch(async (req, res) => {
      const { uai, code_certification, millesime, direction, theme, ext } = await validate(
        { ...req.params, ...req.query },
        {
          uai: Joi.string()
            .pattern(/^[0-9]{7}[A-Z]{1}$/)
            .required(),
          code_certification: Joi.string().required(),
          millesime: Joi.string(),
          ...validators.svg(),
        }
      );

      const results = await formationsStats()
        .find(
          { uai, code_certification, ...(millesime ? { millesime: formatMillesime(millesime) } : {}) },
          { projection: { _id: 0, _meta: 0 } }
        )
        .limit(1)
        .sort({ millesime: -1 })
        .toArray();

      if (results.length === 0) {
        throw Boom.notFound("Formation inconnue");
      }

      const stats = transformDisplayStat()(results[0]);
      return sendStats("formation", stats, res, { direction, theme, ext });
    })
  );

  return router;
};
