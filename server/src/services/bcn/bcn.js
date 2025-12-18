import { compose, writeData, oleoduc } from "oleoduc";
import { createReadStream } from "fs";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import config from "#src/config.js";

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

export async function getNiveauxDiplome(bcnApi) {
  const niveauxDiplome = [];

  await oleoduc(
    await bcnApi.fetchNomenclature("N_NIVEAU_FORMATION_DIPLOME"),
    writeData((data) => {
      niveauxDiplome.push({
        niveau: data["niveau_formation_diplome"],
        libelle_court: data["libelle_court"],
        libelle: data["libelle_100"],
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

export async function getTypeDiplomeSise(bcnApi) {
  const typesDiplome = [];

  await oleoduc(
    await bcnApi.fetchNomenclature("N_TYPE_DIPLOME_SISE"),
    writeData((data) => {
      typesDiplome.push({
        typeDiplome: data["type_diplome_sise"],
        niveau: data["niveau_interministeriel"],
        libelle_court: data["libelle_court"],
        libelle: data["libelle_long"],
      });
    })
  );

  return typesDiplome;
}

export async function getFamilleMetier(filePath = null) {
  const familleMetier = [];
  const stream = compose(createReadStream(filePath || config.bcn.files.familleMetier));
  await oleoduc(
    stream,
    parseCsv({ delimiter: ";" }),
    writeData(async (data) => {
      familleMetier.push({
        code: data.FAMILLE_METIER,
        libelle: data.LIBELLE_EDITION,
      });
    })
  );

  return familleMetier;
}

export function getLienFamilleMetier(filePath = null) {
  const stream = compose(createReadStream(filePath || config.bcn.files.lienFamilleMetier));
  return compose(stream, parseCsv({ delimiter: ";" }));
}
