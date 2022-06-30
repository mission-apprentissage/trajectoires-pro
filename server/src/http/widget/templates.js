import path from "path";
import { getDirname } from "../../common/esmUtils.js";

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
