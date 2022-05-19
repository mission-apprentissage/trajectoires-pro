const express = require("express");
const YAML = require("yamljs");
const path = require("path");
const swagger = require("swagger-ui-express");
const { watch } = require("fs");

const yaml = path.join(__dirname, "./swagger.yml");

function buildHtml() {
  return new Promise((resolve) => {
    const apiSpecifications = YAML.load(yaml);
    const generated = swagger.generateHTML(apiSpecifications);
    resolve(generated);
  });
}

let asyncHtml = buildHtml();
watch(yaml, (eventType) => {
  if (eventType === "change") {
    asyncHtml = buildHtml();
  }
});

module.exports = () => {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.use("/api/doc", swagger.serve, async (req, res) => {
    res.send(await asyncHtml);
  });

  return router;
};
