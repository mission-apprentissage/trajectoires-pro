import { compose, transformData, writeData, oleoduc } from "oleoduc";
import { fetchStream } from "#src/common/utils/httpUtils.js";
import iconv from "iconv-lite";
import { parseCsv } from "#src/common/utils/csvUtils.js";

export const ANCIENS_NIVEAUX_MAPPER = {
  5: "3", // CAP
  4: "4", // BAC
  3: "5", // BTS
  2: "6", // LIC Ou Maitrise
  1: "7", // Master ou Doctorat
  0: "0", //Mention complémentaire
};

export function getDiplome(codeFormation, niveauxDiplome) {
  if (!codeFormation) {
    return null;
  }

  const niveau = codeFormation.substring(0, 3);
  const code = ANCIENS_NIVEAUX_MAPPER[niveau[0]];
  const libelle = niveauxDiplome?.find(({ niveau: n }) => n === niveau)?.libelle_court;

  if (!code || !libelle) {
    return null;
  }

  return {
    code: code,
    libelle: libelle,
  };
}

export async function getNiveauxDiplome(options) {
  const niveauxDiplome = [];

  await oleoduc(
    await getBCNTable("N_NIVEAU_FORMATION_DIPLOME", options),
    writeData((data) => {
      niveauxDiplome.push({
        niveau: data["NIVEAU_FORMATION_DIPLOME"],
        libelle_court: data["LIBELLE_COURT"],
        libelle: data["LIBELLE_100"],
      });
    })
  );

  return niveauxDiplome;
}

export function getDiplomeSup(typeDiplomeSise, typesDiplome) {
  if (!typeDiplomeSise) {
    return null;
  }

  const typeDiplome = typesDiplome.find(({ typeDiplome }) => typeDiplome === typeDiplomeSise);
  if (!typeDiplome) {
    return null;
  }

  const code = ANCIENS_NIVEAUX_MAPPER[typeDiplome.niveau];
  const libelle = typeDiplome.libelle_court;
  if (!code || !libelle) {
    return null;
  }

  return {
    code: code,
    libelle: libelle,
  };
}

export async function getTypeDiplomeSise(options) {
  const typesDiplome = [];

  await oleoduc(
    await getBCNTable("N_TYPE_DIPLOME_SISE", options),
    writeData((data) => {
      typesDiplome.push({
        typeDiplome: data["TYPE_DIPLOME_SISE"],
        niveau: data["NIVEAU_INTERMINISTERIEL"],
        libelle_court: data["LIBELLE_COURT"],
        libelle: data["LIBELLE_LONG"],
      });
    })
  );

  return typesDiplome;
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
