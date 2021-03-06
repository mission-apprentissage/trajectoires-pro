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

export function getDiplome(codeFormation) {
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
