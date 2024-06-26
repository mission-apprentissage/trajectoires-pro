import path from "path";
import { getDirname } from "#src/common/utils/esmUtils.js";
import fs from "fs";
import Boom from "boom";
import ejs from "ejs";

const __dirname = getDirname(import.meta.url);

export const templates = {
  dsfr: {
    formation: {
      vertical: path.join(__dirname, `./dsfr/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/formation-horizontal.svg.ejs`),
    },
    certification: {
      vertical: path.join(__dirname, `./dsfr/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/certification-horizontal.svg.ejs`),
    },
    cfd: {
      vertical: path.join(__dirname, `./dsfr/cfd-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/cfd-horizontal.svg.ejs`),
    },
    error: {
      vertical: path.join(__dirname, `./dsfr/error-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/error-horizontal.svg.ejs`),
    },
    errorEmpty: {
      vertical: path.join(__dirname, `./dsfr/error-empty.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/error-empty.svg.ejs`),
    },
  },
  lba: {
    formation: {
      vertical: path.join(__dirname, `./lba/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./lba/formation-horizontal.svg.ejs`),
    },
    certification: {
      vertical: path.join(__dirname, `./lba/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./lba/certification-horizontal.svg.ejs`),
    },
    cfd: {
      vertical: path.join(__dirname, `./lba/cfd-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./lba/cfd-horizontal.svg.ejs`),
    },
    error: {
      vertical: path.join(__dirname, `./lba/error-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./lba/error-horizontal.svg.ejs`),
    },
    errorEmpty: {
      vertical: path.join(__dirname, `./lba/error-empty.svg.ejs`),
      horizontal: path.join(__dirname, `./lba/error-empty.svg.ejs`),
    },
  },
};

let base64Font = "";
export function loadBase64Font() {
  if (!base64Font) {
    const buffer = fs.readFileSync(path.join(__dirname, `./assets/fonts/Marianne-Regular.woff`));
    base64Font = buffer.toString("base64");
  }
  return base64Font;
}

function getTemplate(templateName, options = {}) {
  const theme = options.theme || "dsfr";
  const direction = options.direction || "vertical";
  const variantes = templates[theme] ?? templates.dsfr;

  const template = variantes?.[templateName]?.[direction];
  if (!template) {
    throw Boom.badRequest("Paramètres du widget invalides");
  }

  return template;
}

export function renderSVG(templateName, data, options) {
  const base64Font = loadBase64Font();
  const template = getTemplate(templateName, options);
  return ejs.renderFile(template, { base64Font, ...data }, { async: true });
}
