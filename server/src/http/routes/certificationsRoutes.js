import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import { compose, transformIntoJSON, transformIntoCSV } from "oleoduc";
import { arrayOf, validate } from "../utils/validators.js";
import * as validators from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { addCsvHeaders, addJsonHeaders } from "../utils/responseUtils.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import { certificationsStats } from "../../common/collections/index.js";
import Boom from "boom";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/certifications.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { millesimes, codes_formation, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          millesimes: arrayOf(Joi.string().required()).default([]),
          codes_formation: arrayOf(Joi.string().required()).default([]),
          ...validators.exports(),
          ...validators.pagination(),
        }
      );

      let { find, pagination } = await findAndPaginate(
        "certificationsStats",
        {
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
            code_formation: (f) => f.code_formation,
            filiere: (f) => f.filiere,
            millesime: (f) => f.millesime,
            nb_annee_term: (f) => f.nb_annee_term,
            nb_poursuite_etudes: (f) => f.nb_poursuite_etudes,
            nb_en_emploi_12_mois: (f) => f.nb_en_emploi_12_mois,
            nb_en_emploi_6_mois: (f) => f.nb_en_emploi_6_mois,
            taux_poursuite_etudes: (f) => f.taux_poursuite_etudes,
            taux_emploi_12_mois: (f) => f.taux_emploi_12_mois,
            taux_emploi_6_mois: (f) => f.taux_emploi_6_mois,
            taux_rupture_contrats: (f) => f.taux_rupture_contrats,
          },
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

      return compose(find.stream(), extensionTransformer, res);
    })
  );

  router.get(
    "/api/inserjeunes/certifications/code_formation/:code_formation/millesime/:millesime",
    tryCatch(async (req, res) => {
      const { code_formation, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          code_formation: Joi.string().required(),
          millesime: Joi.string().required(),
        }
      );

      let found = await certificationsStats().findOne(
        { code_formation, millesime },
        { projection: { _id: 0, _meta: 0 } }
      );

      if (!found) {
        throw Boom.notFound("Code formation et/ou millésime invalide");
      }

      return res.json(found);
    })
  );

  return router;
};
