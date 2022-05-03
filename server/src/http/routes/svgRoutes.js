const fs = require("fs");
const express = require("express");
const logger = require("../../common/logger");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const ejs = require("ejs");
const path = require("path");

const establishmentSvgTemplate = path.join(__dirname, `../templates/establishment.svg.ejs`);

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

  router.get(
    "/api/svg/etablissement/:uai",
    tryCatch(async (req, res) => {
      // TODO find data in db with uai
      const { uai } = req.params;
      logger.info("uai", uai);

      const base64Font = loadBase64Font();
      const data = { base64Font };
      const svg = await ejs.renderFile(establishmentSvgTemplate, data, { async: true });

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  return router;
};
