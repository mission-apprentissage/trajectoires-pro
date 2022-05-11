const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { compose, transformIntoJSON, transformIntoCSV } = require("oleoduc");
const { arrayOf, validate } = require("../utils/validators");
const validators = require("../utils/validators");
const { checkApiKey } = require("../middlewares/authMiddleware");
const { addCsvHeaders, addJsonHeaders } = require("../utils/responseUtils");
const { findAndPaginate } = require("../../common/utils/dbUtils");

module.exports = () => {
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
          ...(millesimes.length > 0 ? { millesime: { $in: millesimes } } : {}),
          ...(codes_formation.length > 0 ? { code_formation: { $in: codes_formation } } : {}),
        },
        {
          limit: items_par_page,
          page,
          projection: { _id: 0 },
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

  return router;
};
