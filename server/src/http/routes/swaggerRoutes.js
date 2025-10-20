import express from "express";
import YAML from "yamljs";
import path from "path";
import swagger from "swagger-ui-express";
import { watch } from "fs";
import { getDirname } from "#src/common/utils/esmUtils.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";

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
  const router = express.Router();

  router.use("/api/doc", authMiddleware("public"), swagger.serve, async (req, res) => {
    res.send(await asyncHtml);
  });

  return router;
};
