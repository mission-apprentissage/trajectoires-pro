// @ts-check

/**
 * @typedef {import("../common/collections/certificationsStats").CertificationsStats} CertificationsStats
 * @typedef {{ codes_certifications: string[], millesime: string, nb_annee_term: number, nb_en_emploi_12_mois: number, nb_en_emploi_6_mois: number, nb_poursuite_etudes: number, nb_sortant: number, taux_emploi_12_mois: number, taux_emploi_6_mois: number, taux_poursuite_etudes: number }} AggregatedStats
 */

/**
 * @param {CertificationsStats[]} stats
 * @returns {AggregatedStats}
 */
const aggregateStats = (stats) => {
  if (stats.length === 0) {
    return null;
  }

  // aggregate numeric data
  const aggregatedStats = stats.reduce((acc, curr) => {
    acc["codes_certifications"] = [...(acc["codes_certifications"] ?? []), curr.code_certification];
    acc["millesime"] = curr.millesime;
    acc["filiere"] = curr.filiere;
    acc["diplome"] = curr.diplome;
    acc["nb_annee_term"] = (acc["nb_annee_term"] ?? 0) + (curr.nb_annee_term ?? 0);
    acc["nb_en_emploi_12_mois"] = (acc["nb_en_emploi_12_mois"] ?? 0) + (curr.nb_en_emploi_12_mois ?? 0);
    acc["nb_en_emploi_6_mois"] = (acc["nb_en_emploi_6_mois"] ?? 0) + (curr.nb_en_emploi_6_mois ?? 0);
    acc["nb_poursuite_etudes"] = (acc["nb_poursuite_etudes"] ?? 0) + (curr.nb_poursuite_etudes ?? 0);
    acc["nb_sortant"] = (acc["nb_sortant"] ?? 0) + (curr.nb_sortant ?? 0);
    return acc;
  }, /** @type {AggregatedStats} */ ({}));

  // compute rates
  aggregatedStats["taux_emploi_12_mois"] = Math.round(
    (aggregatedStats.nb_en_emploi_12_mois / aggregatedStats.nb_sortant) * 100
  );
  aggregatedStats["taux_emploi_6_mois"] = Math.round(
    (aggregatedStats.nb_en_emploi_6_mois / aggregatedStats.nb_sortant) * 100
  );
  aggregatedStats["taux_poursuite_etudes"] = Math.round(
    (aggregatedStats.nb_poursuite_etudes / aggregatedStats.nb_annee_term) * 100
  );

  return aggregatedStats;
};

/**
 * @param {CertificationsStats[]} certificationsStats
 * @returns {{pro?:AggregatedStats, apprentissage?:AggregatedStats}}
 */
export const aggregateCertificationsStatsByFiliere = (certificationsStats) => {
  // keep only one millesime
  const stats = certificationsStats.filter(({ millesime }) => millesime === certificationsStats[0].millesime);

  // aggregate by filiere
  const proStats = aggregateStats(stats.filter(({ filiere }) => filiere === "pro"));
  const apprentissageStats = aggregateStats(stats.filter(({ filiere }) => filiere === "apprentissage"));

  const mergedStats = {
    ...(proStats ? { pro: proStats } : {}),
    ...(apprentissageStats ? { apprentissage: apprentissageStats } : {}),
  };

  return mergedStats;
};
