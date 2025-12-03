import { compose } from "oleoduc";
import iconv from "iconv-lite";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { createReadStream } from "fs";
import config from "#src/config.js";

export const NATURE_UAI_ETABLISSEMENTS_INSERJEUNES = [
  "300", // "Lycée d'enseignement général et technologique"
  "301", // "Lycée d'enseignement technologique"
  "302", // "Lycée d'enseignement général"
  "306", // "Lycée polyvalent"
  "310", // "Lycée climatique"
  "315", // "Lycée expérimental"
  "320", // "Lycée professionnel"
  "334", // "Section d'enseignement professionnel"
  "370", // "Etablissement régional d'enseignement adapté / Lycée d'enseignement adapté"
  "380", // "Maison familiale rurale d'éducation et d'orientation"
  "400", // "Etablissement composé uniquement de STS et/ou de CPGE"
  "430", // "Ecole de formation sanitaire et sociale"
  "440", // "Ecole technico-professionnelle des services"
  "445", // "Ecole de commerce, gestion, comptabilité, vente"
  "450", // "Ecole de formation artistique"
  "480", // "Ecole technico-professionnelle de production industrielle"
  "506", // "Centre régional associé au CNAM"
  "523", // "Université"
  "528", // "Service commun de formation continue"
  "540", // "Composante d'université avec formation diplômante"
  "551", // "Université de technologie"
  "580", // "Ecole d'ingénieurs publique (hors tutelle MESR) ou privée"
  "600", // "Centre de formation d'apprentis, sous convention régionale"
  "605", // "Organisme de formation - Centre de formation d'apprentis"
  "610", // "Centre de formation d'apprentis, sous convention nationale"
  "625", // "Annexe d'un organisme de formation - Centre de formation d'apprentis"
  "630", // "Section d'apprentissage"
  "700", // "Etablissement de formation continue"
  "710", // "GRETA"
  "720", // "Centre d'enseignement à distance"
  "730", // "Etablissement de formation aux métiers du sport"
  "740", // "Centre de formation professionnelle et de promotion agricole"
  "830", // "GIP pour la formation continue et l'insertion professionnelle"
];

export function etablissements(filePath = null) {
  const stream = compose(
    createReadStream(filePath || config.acce.files.etablissements),
    iconv.decodeStream("iso-8859-1")
  );
  return compose(stream, parseCsv({ delimiter: ";" }));
}
