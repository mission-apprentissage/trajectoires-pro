import express from "express";
import YAML from "yamljs";
import path from "path";
import swagger from "swagger-ui-express";
import { watch } from "fs";
import { getDirname } from "../../common/esmUtils.js";

const yaml = path.join(getDirname(import.meta.url), "./swagger.yml");

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

export default () => {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.use("/api/doc", swagger.serve, async (req, res) => {
    res.send(await asyncHtml);
  });

  return router;
};
