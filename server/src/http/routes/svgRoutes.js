// @ts-check
import fs from "fs";
import express from "express";
import ejs from "ejs";
import path from "path";
import Joi from "joi";
import { validate } from "../utils/validators.js";
import { getRateLevel } from "../../common/rateLevels.js";
import { formatMillesime } from "../utils/formatters.js";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import { getDirname } from "../../common/esmUtils.js";
import { formationsStats } from "../../common/collections/formationsStats.js";
import { certificationsStats } from "../../common/collections/certificationsStats.js";

const __dirname = getDirname(import.meta.url);

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
 * @param {InserJeunesData} stats
 * @returns {Array<{rate: number | undefined, labels: string[], level: import("../types").RateLevel}>}
 */
const getRates = (stats) => {
  return Object.entries({
    taux_emploi_6_mois: stats.taux_emploi_6_mois,
    taux_poursuite_etudes: stats.taux_poursuite_etudes,
  })
    .filter(([, value]) => !!value || value === 0)
    .map(([key, value]) => {
      return {
        rate: value,
        labels: labels[key],
        level:
          key === "taux_poursuite_etudes"
            ? "info"
            : getRateLevel(/** @type {keyof typeof labels} */ (key), value, stats.filiere, stats.diplome?.libelle),
      };
    });
};

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
      const { uai, code_formation, millesime } = await validate(params, {
        uai: Joi.string()
          .pattern(/^[0-9]{7}[A-Z]{1}$/)
          .required(),
        code_formation: Joi.string().required(),
        millesime: Joi.string().required(),
      });

      const { direction = "vertical", theme = "dsfr" } = query;

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
