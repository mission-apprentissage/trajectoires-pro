// @ts-check
const fs = require("fs");
const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const ejs = require("ejs");
const path = require("path");
const Joi = require("joi");
const { dbCollection } = require("../../common/mongodb");
const { validate } = require("../utils/validators");

const svgTemplates = {
  // local : action de formation (formation donnée dans un établissement donné)
  formation: {
    vertical: path.join(__dirname, `../templates/formation-vertical.svg.ejs`),
    horizontal: path.join(__dirname, `../templates/formation-horizontal.svg.ejs`),
  },
  // national : diplome
  certification: {
    vertical: path.join(__dirname, `../templates/certification-vertical.svg.ejs`),
    horizontal: path.join(__dirname, `../templates/certification-horizontal.svg.ejs`),
  },
};

/**
 * load base64 font, so that it can be injected in svg
 * @type {string}
 */
let base64Font = "";
const loadBase64Font = () => {
  if (!base64Font) {
    const buffer = fs.readFileSync(path.join(__dirname, `../templates/fonts/Marianne-Regular.woff`));
    base64Font = buffer.toString("base64");
  }
  return base64Font;
};

const labels = /** @type {const} */ ({
  taux_emploi_6_mois: ["sont en emploi 6 mois", "après la fin de la formation."],
  taux_poursuite_etudes: ["poursuivent leurs études."],
});

/**
 * Create on array of rates to feed the ejs template
 *
 * @param {{taux_emploi_6_mois?: number, taux_poursuite_etudes?: number}} stats
 * @returns {Array<{rate: number | undefined, labels: string[]}>}
 */
const getRates = (stats) => {
  const { taux_emploi_6_mois, taux_poursuite_etudes } = stats;
  return Object.entries({ taux_emploi_6_mois, taux_poursuite_etudes })
    .filter(([, value]) => !!value || value === 0)
    .map(([key, value]) => {
      return {
        rate: value,
        labels: labels[key],
      };
    });
};

/**
 * Route module to render SVG images
 */
module.exports = () => {
  const router = express.Router();

  /**
   * e.g: GET /api/svg/uai/0010016M/code_formation/32221023012/millesime/2020-2019?direction=horizontal
   */
  router.get(
    "/api/svg/uai/:uai/code_formation/:code_formation/millesime/:millesime",
    tryCatch(async ({ params, query }, res) => {
      const { uai, code_formation, millesime } = await validate(params, {
        uai: Joi.string()
          .pattern(/^[0-9]{7}[A-Z]{1}$/)
          .required(),
        code_formation: Joi.string().required(),
        millesime: Joi.string().required(),
      });

      const { direction = "vertical" } = query;

      const stats = await dbCollection("formationsStats").findOne(
        {
          uai,
          code_formation,
          millesime,
        },
        {
          projection: { taux_emploi_6_mois: 1, taux_poursuite_etudes: 1 },
        }
      );

      if (!stats) {
        return res.status(404).send("UAI, code formation et/ou millésime invalide");
      }

      const rates = getRates(stats);
      if (rates.length === 0) {
        return res.status(404).send("Donnée non disponible");
      }

      const base64Font = loadBase64Font();
      const data = { base64Font, rates };
      const svg = await ejs.renderFile(svgTemplates.formation[direction] ?? svgTemplates.formation.vertical, data, {
        async: true,
      });

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  /**
   * e.g: GET /api/svg/code_formation/32221023012/millesime/2020-2019?direction=horizontal
   */
  router.get(
    "/api/svg/code_formation/:code_formation/millesime/:millesime",
    tryCatch(async ({ params, query }, res) => {
      const { code_formation, millesime } = await validate(params, {
        code_formation: Joi.string().required(),
        millesime: Joi.string().required(),
      });

      const { direction = "vertical" } = query;

      const inserJeunesData = await dbCollection("inserJeunesNationals").findOne(
        {
          code_formation,
          millesime,
        },
        {
          projection: { taux_emploi_6_mois_apres_la_sortie: 1, taux_de_poursuite_etudes: 1 },
        }
      );

      if (!inserJeunesData) {
        return res.status(404).send("Code formation et/ou millésime invalide");
      }

      const rates = getRates({
        taux_emploi_6_mois: inserJeunesData.taux_emploi_6_mois_apres_la_sortie,
        taux_poursuite_etudes: inserJeunesData.taux_de_poursuite_etudes,
      });
      if (rates.length === 0) {
        return res.status(404).send("Donnée non disponible");
      }

      const base64Font = loadBase64Font();
      const data = { base64Font, rates };
      const svg = await ejs.renderFile(
        svgTemplates.certification[direction] ?? svgTemplates.certification.vertical,
        data,
        { async: true }
      );

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  return router;
};
