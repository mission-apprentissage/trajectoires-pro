import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import { departementalesStats } from "../../common/db/collections/collections.js";
import { addCsvHeaders, addJsonHeaders, sendFilieresStats, sendStats } from "../utils/responseUtils.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import Boom from "boom";
import { findCodeFormationDiplome } from "../../common/bcn.js";
import { getFilieresStats, transformDisplayStat } from "../../common/stats.js";
import { getStatsAsColumns } from "../../common/utils/csvUtils.js";

export default () => {
  const router = express.Router();

  async function sendDepartementalesStats({ find, pagination }, res, options = {}) {
    let extensionTransformer;
    if (options.ext === "csv") {
      addCsvHeaders(res);
      extensionTransformer = transformIntoCSV({
        columns: {
          departement: (f) => f.departement.code,
          nom_departement: (f) => f.departement.nom,
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
        arrayPropertyName: "departementales",
        arrayWrapper: {
          pagination,
        },
      });
    }

    return compose(find.stream(), transformDisplayStat(true), extensionTransformer, res);
  }

  router.get(
    "/api/inserjeunes/departementales.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, departements, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.departements(),
          ...validators.statsList(),
        }
      );

      const paginable = await findAndPaginate(
        departementalesStats(),
        {
          ...(departements.length > 0 ? { "departement.code": { $in: departements } } : {}),
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes.map(formatMillesime) } } : {}),
          ...(code_certifications.length > 0 ? { code_certification: { $in: code_certifications } } : {}),
        },
        {
          limit: items_par_page,
          page,
          projection: { _id: 0, _meta: 0 },
        }
      );

      return sendDepartementalesStats(paginable, res, rest);
    })
  );

  router.get(
    "/api/inserjeunes/departementales/:departement.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { departement, millesimes, code_certifications, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.departement(),
          ...validators.statsList(),
        }
      );

      const paginable = await findAndPaginate(
        departementalesStats(),
        {
          "departement.code": departement,
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes.map(formatMillesime) } } : {}),
          ...(code_certifications.length > 0 ? { code_certification: { $in: code_certifications } } : {}),
        },
        {
          limit: items_par_page,
          page,
          projection: { _id: 0, _meta: 0 },
        }
      );

      return sendDepartementalesStats(paginable, res, rest);
    })
  );

  router.get(
    "/api/inserjeunes/departementales/:departement/certifications/:code_certification.:ext?",
    tryCatch(async (req, res) => {
      const { departement, code_certification, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.departement(),
          code_certification: Joi.string().required(),
          millesime: Joi.string(),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "filieres") {
        const cfd = await findCodeFormationDiplome(code_certification);
        const filieresStats = await getFilieresStats(departementalesStats(), cfd, millesime, null, departement);
        return sendFilieresStats(filieresStats, res, options);
      }

      const results = await departementalesStats()
        .find(
          { "departement.code": departement, code_certification, ...(millesime ? { millesime } : {}) },
          { projection: { _id: 0, _meta: 0 } }
        )
        .limit(1)
        .sort({ millesime: -1 })
        .toArray();

      if (results.length === 0) {
        throw Boom.notFound("Pas de données disponibles");
      }

      const stats = transformDisplayStat()(results[0]);
      return sendStats("certification", stats, res, options);
    })
  );

  return router;
};
