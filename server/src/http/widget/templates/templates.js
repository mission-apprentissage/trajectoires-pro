import path from "path";
import { getDirname } from "../../../common/esmUtils.js";
import fs from "fs";
import Boom from "boom";
import ejs from "ejs";

const __dirname = getDirname(import.meta.url);

export const templates = {
  dsfr: {
    // local : action de formation (formation donnée dans un établissement donné)
    formation: {
      vertical: path.join(__dirname, `./dsfr/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/formation-horizontal.svg.ejs`),
    },
    // national : diplome
    certification: {
      vertical: path.join(__dirname, `./dsfr/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/certification-horizontal.svg.ejs`),
    },
    // national + filieres apprentissage & pro
    filieres: {
      vertical: path.join(__dirname, `./dsfr/filieres-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./dsfr/filieres-horizontal.svg.ejs`),
    },
  },
  onisep: {
    // local : action de formation (formation donnée dans un établissement donné)
    formation: {
      vertical: path.join(__dirname, `./onisep/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./onisep/formation-horizontal.svg.ejs`),
    },
    // national : diplome
    certification: {
      vertical: path.join(__dirname, `./onisep/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./onisep/certification-horizontal.svg.ejs`),
    },
    // national + filieres apprentissage & pro
    filieres: {
      vertical: path.join(__dirname, `./onisep/filieres-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `./onisep/filieres-horizontal.svg.ejs`),
    },
  },
};

let base64Font = "";
function loadBase64Font() {
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
