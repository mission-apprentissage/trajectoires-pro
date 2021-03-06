import path from "path";
import fs from "fs";
import { getDirname } from "../../common/esmUtils.js";
import ejs from "ejs";
import { getRates } from "../../common/rateLevels.js";

const __dirname = getDirname(import.meta.url);

const TEMPLATES = {
  dsfr: {
    // local : action de formation (formation donnée dans un établissement donné)
    formation: {
      vertical: path.join(__dirname, `../templates/dsfr/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/dsfr/formation-horizontal.svg.ejs`),
    },
    // national : diplome
    certification: {
      vertical: path.join(__dirname, `../templates/dsfr/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/dsfr/certification-horizontal.svg.ejs`),
    },
    // national + filieres apprentissage & pro
    filieres: {
      vertical: path.join(__dirname, `../templates/dsfr/filieres-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/dsfr/filieres-horizontal.svg.ejs`),
    },
  },
  onisep: {
    // local : action de formation (formation donnée dans un établissement donné)
    formation: {
      vertical: path.join(__dirname, `../templates/onisep/formation-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/onisep/formation-horizontal.svg.ejs`),
    },
    // national : diplome
    certification: {
      vertical: path.join(__dirname, `../templates/onisep/certification-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/onisep/certification-horizontal.svg.ejs`),
    },
    // national + filieres apprentissage & pro
    filieres: {
      vertical: path.join(__dirname, `../templates/onisep/filieres-vertical.svg.ejs`),
      horizontal: path.join(__dirname, `../templates/onisep/filieres-horizontal.svg.ejs`),
    },
  },
};

/**
 * Load base64 font, so that it can be injected in svg
 *
 * @type {string}
 */
let base64Font = "";
function loadBase64Font() {
  if (!base64Font) {
    const buffer = fs.readFileSync(path.join(__dirname, `../templates/assets/fonts/Marianne-Regular.woff`));
    base64Font = buffer.toString("base64");
  }
  return base64Font;
}

/**
 * Get the right template to display
 *
 * @param {keyof typeof TEMPLATES.dsfr} type
 * @param {object} options
 */
function getTemplate(type, options = {}) {
  const { theme = "dsfr", direction = "vertical" } = options;
  const templates = TEMPLATES[theme] ?? TEMPLATES.dsfr;
  return templates[type][direction] ?? templates[type].vertical ?? TEMPLATES.dsfr[type].vertical;
}

function renderTemplate(type, rates, meta, options) {
  const base64Font = loadBase64Font();
  const data = { base64Font, rates, meta };
  const template = getTemplate(type, options);

  return ejs.renderFile(template, data, {
    async: true,
  });
}

export async function sendWidget(type, stats, res, options) {
  let rates = [];
  if (type === "filieres") {
    rates = { pro: getRates(stats.pro), apprentissage: getRates(stats.apprentissage) };
    if (rates.pro.length === 0 && rates.apprentissage.length === 0) {
      return res.status(404).send("Données statistiques non disponibles");
    }
  } else {
    rates = getRates(stats);
    if (rates.length === 0) {
      return res.status(404).send("Données statistiques non disponibles");
    }
  }

  const svg = await renderTemplate(type, rates, stats._meta, options);

  res.setHeader("content-type", "image/svg+xml");
  return res.status(200).send(svg);
}
