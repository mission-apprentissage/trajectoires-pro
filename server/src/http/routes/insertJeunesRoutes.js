const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { compose, transformData, flattenArray } = require("oleoduc");
const { arrayOf } = require("../utils/validators");
const validators = require("../utils/validators");
const { checkApiKey } = require("../middlewares/authMiddleware");
const { dbCollection } = require("../../common/mongodb");
const { sendAsCSV, sendAsJson } = require("../utils/exporters");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/api/insertjeunes/etablissements.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uais, millesimes, codes_formation, ext } = await Joi.object({
        uais: arrayOf(Joi.string().required()).default([]),
        millesimes: arrayOf(Joi.string().required()).default([]),
        codes_formation: arrayOf(Joi.string().required()).default([]),
        ...validators.exports(),
      }).validateAsync({ ...req.query, ...req.params }, { abortEarly: false });

      let aggregation = dbCollection("etablissementsStats").aggregate([
        {
          $match: {
            ...(uais.length > 0 ? { uai: { $in: uais } } : {}),
          },
        },
        {
          $unwind: "$formations",
        },
        {
          $match: {
            ...(millesimes.length > 0 ? { "formations.millesime": { $in: millesimes } } : {}),
            ...(codes_formation.length > 0 ? { "formations.code_formation": { $in: codes_formation } } : {}),
          },
        },
        {
          $group: {
            _id: "$uai",
            uai: {
              $first: "$uai",
            },
            formations: {
              $push: "$formations",
            },
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);

      if (ext === "csv") {
        compose(
          aggregation.stream(),
          transformData((doc) => {
            return doc.formations.map((formation) => {
              return {
                uai: doc.uai,
                ...formation,
              };
            });
          }),
          flattenArray(),
          sendAsCSV(res, {
            columns: {
              uai: (f) => f.uai,
              code_formation: (f) => f.code_formation,
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
          })
        );
      } else {
        compose(aggregation.stream(), sendAsJson(res));
      }
    })
  );

  return router;
};
