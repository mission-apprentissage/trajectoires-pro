const seuils = [
  {
    statsName: "taux_en_emploi_6_mois",
    filiere: "pro",
    diplome: "3", //CAP
    niveaux: [
      { niveau: "danger", min: 0, max: 9 },
      { niveau: "warning", min: 10, max: 49 },
      { niveau: "success", min: 50, max: 100 },
    ],
  },
  {
    statsName: "taux_en_emploi_6_mois",
    filiere: "pro",
    diplome: "4", //BAC
    niveaux: [
      { niveau: "danger", min: 0, max: 14 },
      { niveau: "warning", min: 15, max: 49 },
      { niveau: "success", min: 50, max: 100 },
    ],
  },
  {
    statsName: "taux_en_emploi_6_mois",
    filiere: "pro",
    diplome: "5", //BTS
    niveaux: [
      { niveau: "danger", min: 0, max: 24 },
      { niveau: "warning", min: 25, max: 49 },
      { niveau: "success", min: 50, max: 100 },
    ],
  },

  {
    statsName: "taux_en_emploi_6_mois",
    filiere: "apprentissage",
    diplome: "3", //CAP
    niveaux: [
      { niveau: "danger", min: 0, max: 24 },
      { niveau: "warning", min: 25, max: 49 },
      { niveau: "success", min: 50, max: 100 },
    ],
  },
  {
    statsName: "taux_en_emploi_6_mois",
    filiere: "apprentissage",
    diplome: "4", //BAC
    niveaux: [
      { niveau: "danger", min: 0, max: 29 },
      { niveau: "warning", min: 30, max: 49 },
      { niveau: "success", min: 50, max: 100 },
    ],
  },
  {
    statsName: "taux_en_emploi_6_mois",
    filiere: "apprentissage",
    diplome: "5", //BTS
    niveaux: [
      { niveau: "danger", min: 0, max: 34 },
      { niveau: "warning", min: 35, max: 49 },
      { niveau: "success", min: 50, max: 100 },
    ],
  },
];

export function findSeuil(stats, name) {
  return (
    seuils.find((s) => {
      return s.statsName === name && s.diplome === stats.diplome.code && s.filiere === stats.filiere;
    }) || {
      //Defaults
      niveaux: [
        { min: 0, max: 25, niveau: "warning" },
        { min: 50, max: 100, niveau: "success" },
      ],
    }
  );
}
