const fs = require("fs");
const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const ejs = require("ejs");
const path = require("path");
const { dbCollection } = require("../../common/mongodb");

const establishmentSvgTemplates = {
  vertical: path.join(__dirname, `../templates/establishment-vertical.svg.ejs`),
  horizontal: path.join(__dirname, `../templates/establishment-horizontal.svg.ejs`),
};

/**
 * load base64 font, so that it can be injected in svg
 */
let base64Font = null;
const loadBase64Font = () => {
  if (!base64Font) {
    const buffer = fs.readFileSync(path.join(__dirname, `../templates/fonts/Marianne-Regular.woff`));
    base64Font = buffer.toString("base64");
  }

  return base64Font;
};

/**
 * Route module to render SVG images
 */
module.exports = () => {
  const router = express.Router();

  /**
   * e.g: GET /api/svg/etablissement/0010016M/32221023012/2020-2019?direction=horizontal
   */
  router.get(
    "/api/svg/etablissement/:uai_de_etablissement/:code_formation/:millesime",
    tryCatch(async ({ params, query }, res) => {
      const { uai_de_etablissement, code_formation, millesime } = params;
      const { direction = "vertical" } = query;

      const insertJeunesData = await dbCollection("insertJeunes").findOne({
        uai_de_etablissement,
        code_formation,
        millesime,
      });

      if (!insertJeunesData) {
        return res.sendStatus(404);
      }

      const base64Font = loadBase64Font();
      const { taux_emploi_6_mois_apres_la_sortie, taux_de_poursuite_etudes } = insertJeunesData;
      const data = { base64Font, taux_emploi_6_mois_apres_la_sortie, taux_de_poursuite_etudes };
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
