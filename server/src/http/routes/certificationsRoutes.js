import express from "express";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import Joi from "joi";
import * as validators from "../utils/validators.js";
import { arrayOf, validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { findAndPaginate } from "../../common/utils/dbUtils.js";
import { formatMillesime } from "../utils/formatters.js";
import { certificationsStats } from "../../common/db/collections/collections.js";
import { addCsvHeaders, addJsonHeaders } from "../utils/responseUtils.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import Boom from "boom";
import { sendWidget } from "../utils/widget.ts";
import { aggregateCertificationsStatsByFiliere } from "../../common/certifications.js";
import { getMetadata } from "../../common/metadata.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/certifications.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          millesimes: arrayOf(Joi.string().required()).default([]),
          code_certifications: arrayOf(Joi.string().required()).default([]),
          ...validators.exports(),
          ...validators.pagination(),
        }
      );

      let { find, pagination } = await findAndPaginate(
        "certificationsStats",
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

  const handleSingleCertification = async (res, params) => {
    const { code_certification, millesime, direction, theme, ext } = params;

    const results = await certificationsStats()
      .find({ code_certification, ...(millesime ? { millesime } : {}) }, { projection: { _id: 0, _meta: 0 } })
      .limit(1)
      .sort({ millesime: -1 })
      .toArray();

    if (results.length === 0) {
      throw Boom.notFound("Certification inconnue");
    }

    const stats = results[0];
    stats._meta = { ...stats._meta, ...getMetadata("certification", stats) };
    if (ext === "svg") {
      return sendWidget("certification", stats, res, { theme, direction });
    } else {
      return res.json(stats);
    }
  };

  const handleMultipleCertifications = async (res, params) => {
    const { codes_certifications, millesime, direction, theme, ext } = params;

    const results = await certificationsStats()
      .find(
        { code_certification: { $in: codes_certifications }, ...(millesime ? { millesime } : {}) },
        { projection: { _id: 0, _meta: 0 } }
      )
      .sort({ millesime: -1 })
      .toArray();

    if (results.length === 0) {
      throw Boom.notFound("Certifications inconnues");
    }

    const mergedStats = aggregateCertificationsStatsByFiliere(results);
    if (ext !== "svg") {
      return res.json(mergedStats);
    }

    if (Object.keys(mergedStats).filter((key) => key !== "_meta").length === 1) {
      return sendWidget("certification", Object.values(mergedStats)[0], res, { theme, direction });
    }

    return sendWidget("filieres", mergedStats, res, { theme, direction });
  };

  router.get(
    "/api/inserjeunes/certifications/:codes_certifications.:ext?",
    tryCatch(async (req, res) => {
      const { codes_certifications, ...params } = await validate(
        { ...req.params, ...req.query },
        {
          codes_certifications: arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string(),
          ...validators.svg(),
        }
      );

      if (codes_certifications.length === 1) {
        return await handleSingleCertification(res, { ...params, code_certification: codes_certifications[0] });
      }
      return await handleMultipleCertifications(res, { ...params, codes_certifications });
    })
  );

  return router;
};
