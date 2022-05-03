const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");

const ejs = require("ejs");
const path = require("path");

const insertionBadgeTemplate = path.join(__dirname, `../templates/insertionBadge.svg.ejs`);

/**
 * Sample route module for displaying hello message
 */
module.exports = () => {
  const router = express.Router();

  router.get(
    "/api/svg/badge",
    tryCatch(async (req, res) => {
      const rate = 87;
      const color = "#4c1";
      const svg = await ejs.renderFile(insertionBadgeTemplate, { rate, color }, { async: true });

      res.setHeader("content-type", "image/svg+xml");
      return res.status(200).send(svg);
    })
  );

  return router;
};
