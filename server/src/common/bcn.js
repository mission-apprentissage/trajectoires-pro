import { compose, transformData } from "oleoduc";
import { fetchStream } from "./utils/httpUtils.js";
import iconv from "iconv-lite";
import { parseCsv } from "./utils/csvUtils.js";

const NIVEAUX_INTERMINISTERIEL_DIPLOMES = {
  0: "MENTION COMPLEMENTAIRE",
  1: "MASTER",
  2: "LICENCE",
  3: "BTS",
  4: "BAC",
  5: "CAP",
  6: "DIPLOME NATIONAL DU BREVET",
  7: "PREELEMENTAIRE ET ELEMENTAIRE",
  9: "BREVET D'APTITUDE",
};

export async function getBCNTable(table, options = {}) {
  let stream =
    options[table] ||
    compose(
      await fetchStream(`https://infocentre.pleiade.education.fr/bcn/index.php/export/CSV?n=${table}&separator=%7C`),
      iconv.decodeStream("iso-8859-1")
    );

  return compose(
    stream,
    transformData(
      (data) => {
        return data.toString().replace(/"/g, "'");
      },
      { objectMode: false }
    ),
    parseCsv({ delimiter: "|" })
  );
}

export async function loadNiveauxFormation(options) {
  const table = await getBCNTable("N_NIVEAU_FORMATION_DIPLOME", options);

  const niveaux = [];
  for await (const data of table) {
    niveaux.push({
      NIVEAU_FORMATION_DIPLOME: data.NIVEAU_FORMATION_DIPLOME,
      NIVEAU_INTERMINISTERIEL: data.NIVEAU_INTERMINISTERIEL,
    });
  }

  return niveaux;
}

export async function loadMefs(niveaux, options) {
  const table = await getBCNTable("N_MEF", options);

  const array = [];
  for await (const data of table) {
    array.push({
      MEF: data.MEF,
      FORMATION_DIPLOME: data.FORMATION_DIPLOME,
      MEF_STAT_11: data.MEF_STAT_11,
      MEF_STAT_9: data.MEF_STAT_9,
    });
  }

  return array;
}

export function getNiveau(code) {
  return NIVEAUX_INTERMINISTERIEL_DIPLOMES[code];
}
