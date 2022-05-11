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

module.exports = {
  RATE_LEVELS,
};
