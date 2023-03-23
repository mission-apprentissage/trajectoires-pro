import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { arrayOf, validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import { certificationsStats } from "../../common/db/collections/collections.js";
import { addCsvHeaders, addJsonHeaders, sendFilieresStats, sendStats } from "../utils/responseUtils.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import Boom from "boom";
import { findCodeFormationDiplome } from "../../common/bcn.js";
import { getLastMillesimes, getFilieresStats, transformDisplayStat } from "../../common/stats.js";
import { getStatsAsColumns } from "../../common/utils/csvUtils.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/certifications.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.statsList(),
        }
      );

      let { find, pagination } = await findAndPaginate(
        certificationsStats(),
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

      let extensionTransformer;
      if (ext === "csv") {
        addCsvHeaders(res);
        extensionTransformer = transformIntoCSV({
          columns: {
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
          arrayPropertyName: "certifications",
          arrayWrapper: {
            pagination,
          },
        });
      }

      return compose(find.stream(), transformDisplayStat(true), extensionTransformer, res);
    })
  );

  router.get(
    "/api/inserjeunes/certifications/:codes_certifications.:ext?",
    tryCatch(async (req, res) => {
      const { codes_certifications, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          codes_certifications: arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(getLastMillesimes()),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "filieres" || codes_certifications.length > 1) {
        const cfd = await findCodeFormationDiplome(codes_certifications);
        const filieresStats = await getFilieresStats(certificationsStats(), cfd, millesime);
        return sendFilieresStats(filieresStats, res, options);
      }

      const code_certification = codes_certifications[0];
      const results = await certificationsStats()
        .find({ code_certification, ...(millesime ? { millesime } : {}) }, { projection: { _id: 0, _meta: 0 } })
        .limit(1)
        .sort({ millesime: -1 })
        .toArray();

      if (results.length === 0) {
        throw Boom.notFound("Certification inconnue");
      }

      const stats = transformDisplayStat()(results[0]);
      return sendStats("certification", stats, res, options);
    })
  );

  return router;
};
