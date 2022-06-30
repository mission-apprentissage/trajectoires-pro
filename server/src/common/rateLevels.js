const RATE_LEVELS = {
  taux_emploi_6_mois: {
    pro: {
      CAP: { warning: 10, success: 50 },
      BAC: { warning: 15, success: 50 },
      BTS: { warning: 25, success: 50 },
      default: { warning: 25, success: 50 },
    },
    apprentissage: {
      CAP: { warning: 25, success: 50 },
      BP: { warning: 35, success: 50 },
      BAC: { warning: 30, success: 50 },
      BTS: { warning: 35, success: 50 },
      default: { warning: 25, success: 50 },
    },
    default: { warning: 25, success: 50 },
  },
  default: { warning: 25, success: 50 },
};

const LABELS = {
  taux_emploi_6_mois: ["sont en emploi 6 mois", "après la fin de la formation."],
  taux_poursuite_etudes: ["poursuivent leurs études."],
};

export function getRateLevel(key, value, filiere, diplome) {
  const levels =
    RATE_LEVELS[key]?.[filiere]?.[diplome] ??
    RATE_LEVELS[key]?.[filiere]?.default ??
    RATE_LEVELS[key]?.default ??
    RATE_LEVELS.default;

  return value < levels.success ? (value < levels.warning ? "danger" : "warning") : "success";
}

export const getRates = (stats) => {
  return Object.entries({
    taux_emploi_6_mois: stats.taux_emploi_6_mois,
    taux_poursuite_etudes: stats.taux_poursuite_etudes,
  })
    .filter(([, value]) => !!value || value === 0)
    .map(([key, value]) => {
      const level = getRateLevel(key, value, stats.filiere, stats.diplome?.libelle);

      return {
        rate: value,
        labels: LABELS[key],
        level: key === "taux_poursuite_etudes" ? "info" : level,
      };
    });
};
