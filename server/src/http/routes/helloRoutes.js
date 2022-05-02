const express = require("express");
const logger = require("../../common/logger");
const tryCatch = require("../middlewares/tryCatchMiddleware");

/**
 * Sample route module for displaying hello message
 */
module.exports = () => {
  const router = express.Router();

  router.get(
    "/api/hello",
    tryCatch(async (req, res) => {
      logger.info("Hello World");
      return res.json({
        message: "Hello World",
      });
    })
  );

  return router;
};
