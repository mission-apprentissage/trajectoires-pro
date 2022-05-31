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
import { getRates } from "../../common/rateLevels.js";
import { renderTemplate } from "../utils/templates.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/formations.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uais, millesimes, codes_formation, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          uais: arrayOf(
            Joi.string()
              .pattern(/^[0-9]{7}[A-Z]{1}$/)
              .required()
          ).default([]),
          millesimes: arrayOf(Joi.string().required()).default([]),
          codes_formation: arrayOf(Joi.string().required()).default([]),
          ...validators.exports(),
          ...validators.pagination(),
        }
      );

      let { find, pagination } = await findAndPaginate(
        "formationsStats",
        {
          ...(uais.length > 0 ? { uai: { $in: uais } } : {}),
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes.map(formatMillesime) } } : {}),
          ...(codes_formation.length > 0 ? { code_formation: { $in: codes_formation } } : {}),
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
            code_formation: (f) => f.code_formation,
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
    "/api/inserjeunes/formations/uai/:uai/code_formation/:code_formation/millesime/:millesime.:ext?",
    tryCatch(async (req, res) => {
      const { uai, code_formation, millesime, direction, theme, ext } = await validate(
        { ...req.params, ...req.query },
        {
          uai: Joi.string()
            .pattern(/^[0-9]{7}[A-Z]{1}$/)
            .required(),
          code_formation: Joi.string().required(),
          millesime: Joi.string().required(),
          ...validators.stats(),
        }
      );

      let stats = await formationsStats().findOne(
        { uai, code_formation, millesime: formatMillesime(millesime) },
        { projection: { _id: 0, _meta: 0 } }
      );

      if (!stats) {
        throw Boom.notFound("UAI, code formation et/ou millésime invalide");
      }

      if (ext === "svg") {
        const rates = getRates(stats);
        if (rates.length === 0) {
          return res.status(404).send("Donnée non disponible");
        }

        const svg = await renderTemplate("formation", rates, {
          theme,
          direction,
        });

        res.setHeader("content-type", "image/svg+xml");
        return res.status(200).send(svg);
      } else {
        return res.json(stats);
      }
    })
  );

  return router;
};
