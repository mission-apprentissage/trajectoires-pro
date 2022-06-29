import { compose, transformData } from "oleoduc";
import { fetchStream } from "./utils/httpUtils.js";
import iconv from "iconv-lite";
import { parseCsv } from "./utils/csvUtils.js";

const ANCIENS_NIVEAUX_MAPPER = {
  5: "3",
  4: "4",
  3: "5",
  2: "6",
  1: "7",
  0: "0", //Mention complémentaire
};

const NIVEAUX_LIBELLES = {
  0: "MC",
  3: "CAP",
  4: "BAC",
  5: "BTS",
  6: "LIC",
  7: "MASTER",
};

export function asDiplome(codeFormation) {
  if (!codeFormation) {
    return null;
  }

  const niveau = codeFormation.substring(0, 1);
  const code = ANCIENS_NIVEAUX_MAPPER[niveau];

  if (!code) {
    return null;
  }

  return {
    code: code,
    libelle: NIVEAUX_LIBELLES[code],
  };
}

export async function getBCNTable(tableName, options = {}) {
  let stream =
    options[tableName] ||
    compose(
      await fetchStream(
        `https://infocentre.pleiade.education.fr/bcn/index.php/export/CSV?n=${tableName}&separator=%7C`
      ),
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
