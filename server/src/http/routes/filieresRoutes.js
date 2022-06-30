import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { arrayOf, validate } from "../utils/validators.js";
import { certificationsStats } from "../../common/db/collections/collections.js";
import Boom from "boom";
import { sendFilieresWidget } from "../widget/widget.js";
import { computeFilieresStats } from "../../common/filieres.js";
import { omitNil } from "../../common/utils/objectUtils.js";
import { getRates } from "../../common/rateLevels.js";

async function getFilieresStats(codes_certifications, millesime) {
  const stats = await certificationsStats()
    .find(omitNil({ code_certification: { $in: codes_certifications }, millesime }), {
      projection: { _id: 0, _meta: 0 },
    })
    .sort({ millesime: -1 })
    .toArray();

  if (stats.length === 0) {
    throw Boom.notFound("Certifications inconnues");
  }

  return computeFilieresStats(stats);
}

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/filieres/:codes_certifications.:ext?",
    tryCatch(async (req, res) => {
      const { codes_certifications, millesime, direction, theme, ext } = await validate(
        { ...req.params, ...req.query },
        {
          codes_certifications: arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string(),
          ...validators.svg(),
        }
      );

      const stats = await getFilieresStats(codes_certifications, millesime);

      if (ext !== "svg") {
        return res.json(stats);
      } else {
        const rates = {
          pro: getRates(stats.pro),
          apprentissage: getRates(stats.apprentissage),
        };

        if (rates.pro.length === 0 && rates.apprentissage.length === 0) {
          throw Boom.notFound("Statistiques non disponibles");
        }

        return sendFilieresWidget(stats, rates, res, { theme, direction });
      }
    })
  );

  return router;
};
