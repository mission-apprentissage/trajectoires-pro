// @ts-check
const fs = require("fs");
const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const ejs = require("ejs");
const path = require("path");
const Joi = require("joi");
const { dbCollection } = require("../../common/mongodb");
const { validate } = require("../utils/validators");

const establishmentSvgTemplates = {
  vertical: path.join(__dirname, `../templates/establishment-vertical.svg.ejs`),
  horizontal: path.join(__dirname, `../templates/establishment-horizontal.svg.ejs`),
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
  taux_emploi_6_mois_apres_la_sortie: ["sont en emploi 6 mois", "après la fin de la formation."],
  taux_de_poursuite_etudes: ["poursuivent leurs études."],
});

/**
 * Create on array of rates to feed the ejs template
 *
 * @param {{taux_emploi_6_mois_apres_la_sortie?: number, taux_de_poursuite_etudes?: number}} inserJeunesEtablissementsData
 * @returns {Array<{rate: number | undefined, labels: string[]}>}
 */
const getRates = (inserJeunesEtablissementsData) => {
  const { taux_emploi_6_mois_apres_la_sortie, taux_de_poursuite_etudes } = inserJeunesEtablissementsData;
  const rates = Object.entries({ taux_emploi_6_mois_apres_la_sortie, taux_de_poursuite_etudes })
    .filter(([, value]) => !!value || value === 0)
    .map(([key, value]) => {
      return {
        rate: value,
        labels: labels[key],
      };
    });

  return rates;
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
    "/api/svg/uai/:uai_de_etablissement/code_formation/:code_formation/millesime/:millesime",
    tryCatch(async ({ params, query }, res) => {
      const { uai_de_etablissement, code_formation, millesime } = await validate(params, {
        uai_de_etablissement: Joi.string()
          .pattern(/^[0-9]{7}[A-Z]{1}$/)
          .required(),
        code_formation: Joi.string().required(),
        millesime: Joi.string().required(),
      });

      const { direction = "vertical" } = query;

      const inserJeunesEtablissementsData = await dbCollection("inserJeunesEtablissements").findOne(
        {
          uai_de_etablissement,
          code_formation,
          millesime,
        },
        {
          projection: { taux_emploi_6_mois_apres_la_sortie: 1, taux_de_poursuite_etudes: 1 },
        }
      );

      if (!inserJeunesEtablissementsData) {
        return res.status(404).send("UAI, code formation et/ou millésime invalide");
      }

      const rates = getRates(inserJeunesEtablissementsData);
      if (rates.length === 0) {
        return res.status(404).send("Donnée non disponible");
      }

      const base64Font = loadBase64Font();
      const data = { base64Font, rates };
      const svg = await ejs.renderFile(
        establishmentSvgTemplates[direction] ?? establishmentSvgTemplates.vertical,
        data,
        { async: true }
      );

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  return router;
};
