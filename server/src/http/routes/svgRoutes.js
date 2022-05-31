// @ts-check
import express from "express";
import Joi from "joi";
import { validate } from "../utils/validators.js";
import { getRates } from "../../common/rateLevels.js";
import { formatMillesime } from "../utils/formatters.js";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import { certificationsStats, formationsStats } from "../../common/collections/collections.js";
import { renderTemplate } from "../utils/templates.js";

/**
 * Route module to render SVG images
 */
export default () => {
  const router = express.Router();

  /**
   * e.g: GET /api/svg/uai/0010016M/code_formation/32221023012/millesime/2020-2019?direction=horizontal&theme=onisep
   */
  router.get(
    "/api/svg/uai/:uai/code_formation/:code_formation/millesime/:millesime",
    tryCatch(async ({ params, query }, res) => {
      const { uai, code_formation, millesime, direction, theme } = await validate(
        { ...params, ...query },
        {
          uai: Joi.string()
            .pattern(/^[0-9]{7}[A-Z]{1}$/)
            .required(),
          code_formation: Joi.string().required(),
          millesime: Joi.string().required(),
          direction: Joi.string(),
          theme: Joi.string(),
        }
      );

      const stats = await formationsStats().findOne({
        uai,
        code_formation,
        millesime: formatMillesime(millesime),
      });

      if (!stats) {
        return res.status(404).send("UAI, code formation et/ou millésime invalide");
      }

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
    })
  );

  /**
   * e.g: GET /api/svg/code_formation/32221023012/millesime/2020-2019?direction=horizontal&theme=onisep
   */
  router.get(
    "/api/svg/code_formation/:code_formation/millesime/:millesime",
    tryCatch(async ({ params, query }, res) => {
      const { code_formation, millesime, direction, theme } = await validate(
        { ...params, ...query },
        {
          code_formation: Joi.string().required(),
          millesime: Joi.string().required(),
          direction: Joi.string(),
          theme: Joi.string(),
        }
      );

      const stats = await certificationsStats().findOne(
        {
          code_formation,
          millesime,
        },
        {
          projection: {
            taux_emploi_6_mois: 1,
            taux_poursuite_etudes: 1,
            filiere: 1,
          },
        }
      );

      if (!stats) {
        return res.status(404).send("Code formation et/ou millésime invalide");
      }

      const rates = getRates(stats);
      if (rates.length === 0) {
        return res.status(404).send("Donnée non disponible");
      }

      const svg = await renderTemplate("certification", rates, {
        theme,
        direction,
      });

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  return router;
};
