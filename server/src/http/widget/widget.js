import path from "path";
import fs from "fs";
import { getDirname } from "../../common/esmUtils.js";
import ejs from "ejs";
import { getRates } from "../../common/rateLevels.js";
import { templates } from "./templates.js";
import Boom from "boom";

const __dirname = getDirname(import.meta.url);

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

function renderTemplate(template, rates, meta) {
  const base64Font = loadBase64Font();
  const data = { base64Font, rates, meta };

  return ejs.renderFile(template, data, { async: true });
}

export async function sendFilieresWidget(stats, rates, res, options) {
  const template = getTemplate("filieres", options);
  const svg = await renderTemplate(template, rates, stats._meta);

  res.setHeader("content-type", "image/svg+xml");
  return res.status(200).send(svg);
}

export async function sendWidget(type, stats, res, options) {
  const rates = getRates(stats);
  if (rates.length === 0) {
    throw Boom.notFound("Statistiques non disponibles");
  }

  const template = getTemplate(type, options);
  const svg = await renderTemplate(template, rates, stats._meta);

  res.setHeader("content-type", "image/svg+xml");
  return res.status(200).send(svg);
}
