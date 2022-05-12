// @ts-check

const RATE_LEVELS = {
  taux_emploi_6_mois: {
    pro: {
      CAP: { warning: 10, success: 50 },
      "BAC PRO": { warning: 15, success: 50 },
      BTS: { warning: 25, success: 50 },
      default: { warning: 25, success: 50 },
    },
    apprentissage: {
      CAP: { warning: 25, success: 50 },
      BP: { warning: 35, success: 50 },
      "BAC PRO": { warning: 30, success: 50 },
      BTS: { warning: 35, success: 50 },
      default: { warning: 25, success: 50 },
    },
    default: { warning: 25, success: 50 },
  },
  default: { warning: 25, success: 50 },
};

/**
 * Get a level to adjust icon and style in the template for this data
 *
 * @param {"taux_emploi_6_mois" | "taux_poursuite_etudes"} key
 * @param {number} value
 * @param {"apprentissage"|"pro"} filiere
 * @param {string} diplome
 */
const getRateLevel = (key, value, filiere, diplome) => {
  const levels =
    RATE_LEVELS[key]?.[filiere]?.[diplome] ??
    RATE_LEVELS[key]?.[filiere]?.default ??
    RATE_LEVELS[key]?.default ??
    RATE_LEVELS.default;

  return value < levels.success ? (value < levels.warning ? "danger" : "warning") : "success";
};

module.exports = {
  getRateLevel,
};
