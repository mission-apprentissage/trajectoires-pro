import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { arrayOf, validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { addCsvHeaders, addJsonHeaders, sendStats, sendImageOnError } from "../utils/responseUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { getStatsAsColumns } from "../../common/utils/csvUtils.js";
import { getLastMillesimesFormations, transformDisplayStat } from "../../common/stats.js";

import FormationsRepository from "../../common/repositories/formations.js";
import { ErrorFormationNotFound, ErrorNoDataForMillesime } from "../errors.js";

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

      let { find, pagination } = await FormationsRepository.findAndPaginate(
        {
          uai: uais,
          region: regions,
          millesime: millesimes,
          code_certification: code_certifications,
        },
        {
          limit: items_par_page,
          page,
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

      compose(find, transformDisplayStat(true), extensionTransformer, res);
    })
  );

  router.get(
    "/api/inserjeunes/formations/:uai-:code_certification.:ext?",
    tryCatch(async (req, res) => {
      const { uai, code_certification, millesime, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          uai: Joi.string()
            .pattern(/^[0-9]{7}[A-Z]{1}$/)
            .required(),
          code_certification: Joi.string().required(),
          millesime: Joi.string().default(getLastMillesimesFormations()),
          ...validators.svg(),
        }
      );

      return sendImageOnError(
        async () => {
          const exist = await FormationsRepository.exist({ uai, code_certification });
          if (!exist) {
            throw new ErrorFormationNotFound();
          }

          const result = await FormationsRepository.first({
            uai,
            code_certification,
            millesime: formatMillesime(millesime),
          });

          if (!result) {
            const millesimesAvailable = await FormationsRepository.findMillesime({ uai, code_certification });
            throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
          }

          const stats = transformDisplayStat()(result);
          return sendStats("formation", stats, res, options);
        },
        res,
        { type: "formations" },
        options
      );
    })
  );

  return router;
};
