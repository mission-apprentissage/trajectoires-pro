import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "#src/http/utils/validators.js";
import { arrayOf, validate } from "#src/http/utils/validators.js";
import { checkApiKey } from "#src/http/middlewares/authMiddleware.js";
import { addCsvHeaders, addJsonHeaders, sendStats, sendImageOnError } from "#src/http/utils/responseUtils.js";
import { formatMillesime } from "#src/http/utils/formatters.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import { getLastMillesimesFormations, transformDisplayStat } from "#src/common/stats.js";

import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import { ErrorFormationNotFound, ErrorNoDataForMillesime } from "#src/http/errors.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/formations.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uais, regions, academies, millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          uais: arrayOf(
            Joi.string()
              .pattern(/^[0-9]{7}[A-Z]{1}$/)
              .required()
          ).default([]),
          ...validators.regions(),
          ...validators.academies(),
          ...validators.statsList(),
        }
      );

      let { find, pagination } = await FormationStatsRepository.findAndPaginate(
        {
          uai: uais,
          region: regions,
          "academie.code": academies,
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
          const exist = await FormationStatsRepository.exist({ uai, code_certification });
          if (!exist) {
            throw new ErrorFormationNotFound();
          }

          const result = await FormationStatsRepository.first({
            uai,
            code_certification,
            millesime: formatMillesime(millesime),
          });

          if (!result) {
            const millesimesAvailable = await FormationStatsRepository.findMillesime({ uai, code_certification });
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
