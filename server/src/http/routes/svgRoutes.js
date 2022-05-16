// @ts-check
const fs = require("fs");
const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const ejs = require("ejs");
const path = require("path");
const Joi = require("joi");
const { dbCollection } = require("../../common/mongodb");
const { validate } = require("../utils/validators");
const { getRateLevel } = require("../../common/rateLevels");
const { formatMillesime } = require("../utils/formatters");

/**
 * @typedef {{taux_emploi_6_mois?: number, taux_poursuite_etudes?: number, filiere?:"apprentissage" | "pro", diplome?:string}} InserJeunesData
 */

const svgTemplates = {
  dsfr: {
    // local : action de formation (formation donnée dans un établissement donné)
    formation: {
      vertical: path.join(__dirname, `../templates/dsfr/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/dsfr/formation-horizontal.svg.ejs`),
    },
    // national : diplome
    certification: {
      vertical: path.join(__dirname, `../templates/dsfr/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/dsfr/certification-horizontal.svg.ejs`),
    },
  },
  onisep: {
    // local : action de formation (formation donnée dans un établissement donné)
    formation: {
      vertical: path.join(__dirname, `../templates/onisep/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/onisep/formation-horizontal.svg.ejs`),
    },
    // national : diplome
    certification: {
      vertical: path.join(__dirname, `../templates/onisep/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/onisep/certification-horizontal.svg.ejs`),
    },
  },
};

/**
 * Get the right template to display
 *
 * @param {string} theme
 * @param {keyof typeof svgTemplates.dsfr} type
 * @param {string} direction
 */
const getTemplate = (theme = "dsfr", type, direction) => {
  const templates = svgTemplates[theme] ?? svgTemplates.dsfr;
  return templates[type][direction] ?? templates[type].vertical ?? svgTemplates.dsfr[type].vertical;
};

/**
 * Load base64 font, so that it can be injected in svg
 *
 * @type {string}
 */
let base64Font = "";
const loadBase64Font = () => {
  if (!base64Font) {
    const buffer = fs.readFileSync(path.join(__dirname, `../templates/assets/fonts/Marianne-Regular.woff`));
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
 * @param {InserJeunesData} inserJeunesData
 * @returns {Array<{rate: number | undefined, labels: string[], level: import("../types").RateLevel}>}
 */
const getRates = ({ taux_emploi_6_mois, taux_poursuite_etudes, filiere, diplome }) => {
  return Object.entries({ taux_emploi_6_mois, taux_poursuite_etudes })
    .filter(([, value]) => !!value || value === 0)
    .map(([key, value]) => {
      return {
        rate: value,
        labels: labels[key],
        level:
          key === "taux_poursuite_etudes"
            ? "info"
            : getRateLevel(/** @type {keyof typeof labels} */ (key), value, filiere, diplome),
      };
    });
};

/**
 * Route module to render SVG images
 */
module.exports = () => {
  const router = express.Router();

  /**
   * e.g: GET /api/svg/uai/0010016M/code_formation/32221023012/millesime/2020-2019?direction=horizontal&theme=onisep
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

      const { direction = "vertical", theme = "dsfr" } = query;

      /**
       * @type {import("../../common/collections/formationsStats").FormationsStats}
       */
      const stats = await dbCollection("formationsStats").findOne(
        {
          uai,
          code_formation,
          millesime: formatMillesime(millesime),
        },
        {
          projection: { taux_emploi_6_mois: 1, taux_poursuite_etudes: 1, filiere: 1 },
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
      const svg = await ejs.renderFile(getTemplate(theme.toString(), "formation", direction.toString()), data, {
        async: true,
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
      const { code_formation, millesime } = await validate(params, {
        code_formation: Joi.string().required(),
        millesime: Joi.string().required(),
      });

      const { direction = "vertical", theme = "dsfr" } = query;

      /**
       * @type {import("../../common/collections/inserJeunesNationals").InserJeunesNationals}
       */
      const inserJeunesData = await dbCollection("inserJeunesNationals").findOne(
        {
          code_formation,
          millesime: formatMillesime(millesime),
        },
        {
          projection: {
            taux_emploi_6_mois_apres_la_sortie: 1,
            taux_de_poursuite_etudes: 1,
            type_de_diplome: 1,
            type: 1,
          },
        }
      );

      if (!inserJeunesData) {
        return res.status(404).send("Code formation et/ou millésime invalide");
      }

      const rates = getRates({
        taux_emploi_6_mois: inserJeunesData.taux_emploi_6_mois_apres_la_sortie,
        taux_poursuite_etudes: inserJeunesData.taux_de_poursuite_etudes,
        filiere: inserJeunesData.type,
        diplome: inserJeunesData.type_de_diplome,
      });
      if (rates.length === 0) {
        return res.status(404).send("Donnée non disponible");
      }

      const base64Font = loadBase64Font();
      const data = { base64Font, rates };
      const svg = await ejs.renderFile(getTemplate(theme.toString(), "certification", direction.toString()), data, {
        async: true,
      });

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  return router;
};
