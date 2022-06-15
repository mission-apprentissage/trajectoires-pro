import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import { arrayOf, validate } from "../utils/validators.js";
import * as validators from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { addCsvHeaders, addJsonHeaders } from "../utils/responseUtils.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import Boom from "boom";
import { compose, transformIntoJSON, transformIntoCSV } from "oleoduc";
import { formationsStats } from "../../common/collections/collections.js";
import { sendWidget } from "../utils/widget.ts";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/formations.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uais, millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          uais: arrayOf(
            Joi.string()
              .pattern(/^[0-9]{7}[A-Z]{1}$/)
              .required()
          ).default([]),
          millesimes: arrayOf(Joi.string().required()).default([]),
          code_certifications: arrayOf(Joi.string().required()).default([]),
          ...validators.exports(),
          ...validators.pagination(),
        }
      );

      let { find, pagination } = await findAndPaginate(
        "formationsStats",
        {
          ...(uais.length > 0 ? { uai: { $in: uais } } : {}),
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
            nb_annee_term: (f) => f.nb_annee_term,
            nb_en_emploi_12_mois: (f) => f.nb_en_emploi_12_mois,
            nb_en_emploi_6_mois: (f) => f.nb_en_emploi_6_mois,
            nb_poursuite_etudes: (f) => f.nb_poursuite_etudes,
            nb_sortant: (f) => f.nb_sortant,
            taux_emploi_12_mois: (f) => f.taux_emploi_12_mois,
            taux_emploi_6_mois: (f) => f.taux_emploi_6_mois,
            taux_poursuite_etudes: (f) => f.taux_poursuite_etudes,
          },
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

      compose(find.stream(), extensionTransformer, res);
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

      const stats = results[0];
      if (ext === "svg") {
        return sendWidget("formation", stats, res, { theme, direction });
      } else {
        return res.json(stats);
      }
    })
  );

  return router;
};
