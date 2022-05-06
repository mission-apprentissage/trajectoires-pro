const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const { compose, transformIntoJSON } = require("oleoduc");
const { arrayOf } = require("../utils/validators");
const { checkApiKey } = require("../middlewares/authMiddleware");
const { dbCollection } = require("../../common/mongodb");

module.exports = () => {
  const router = express.Router();

  router.get(
    "/api/insertjeunes/etablissements",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uais, millesimes, codes_formation } = await Joi.object({
        uais: arrayOf(
          Joi.string()
            .pattern(/^[0-9]{7}[A-Z]{1}$/)
            .required()
        ).default([]),
        millesimes: arrayOf(Joi.string().required()).default([]),
        codes_formation: arrayOf(Joi.string().required()).default([]),
      }).validateAsync(req.query, { abortEarly: false });

      return compose(
        dbCollection("etablissementsStats")
          .aggregate([
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
          ])
          .stream(),
        transformIntoJSON(),
        res
      );
    })
  );

  return router;
};
