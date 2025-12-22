import { Readable } from "stream";
import { mapValues } from "lodash-es";
import { DataEnseignementSupApi } from "./DataEnseignementSupApi.js";
import { compose, transformData, filterData } from "oleoduc";

function mergeApiStats(statsStream, millesime) {
  const millesimePart = millesime.split("_");

  return compose(
    statsStream,
    // We only keep promo matching one of the millesime's year
    filterData((stats) => {
      return stats.promo.every((p) => millesimePart.some((m) => m === p));
    }),
    // Format data
    transformData((stats) => {
      const formatNd = (parser) => (s) => (s === null || s === "nd" ? null : parser(s));

      const transformations = {
        nb_poursuivants: formatNd(parseInt),
        nb_sortants: formatNd(parseInt),
        tx_sortants_en_emploi_sal_fr_6: formatNd(parseFloat),
        tx_sortants_en_emploi_sal_fr_12: formatNd(parseFloat),
        tx_sortants_en_emploi_sal_fr_18: formatNd(parseFloat),
        tx_sortants_en_emploi_sal_fr_24: formatNd(parseFloat),
        nb_sortants_en_emploi_sal_fr_6: formatNd(parseInt),
        nb_sortants_en_emploi_sal_fr_12: formatNd(parseInt),
        nb_sortants_en_emploi_sal_fr_18: formatNd(parseInt),
        nb_sortants_en_emploi_sal_fr_24: formatNd(parseInt),
        salaire_q1_6: formatNd(parseInt),
        salaire_q1_12: formatNd(parseInt),
        salaire_q1_18: formatNd(parseInt),
        salaire_q1_24: formatNd(parseInt),
        salaire_q2_6: formatNd(parseInt),
        salaire_q2_12: formatNd(parseInt),
        salaire_q2_18: formatNd(parseInt),
        salaire_q2_24: formatNd(parseInt),
        salaire_q3_6: formatNd(parseInt),
        salaire_q3_12: formatNd(parseInt),
        salaire_q3_18: formatNd(parseInt),
        salaire_q3_24: formatNd(parseInt),
      };
      return mapValues(stats, (s, key) => {
        return transformations[key] ? transformations[key](s) : s;
      });
    }),

    // Add  millesime
    transformData((stat) => {
      return {
        ...stat,
        millesime: stat.promo.join("_"),
      };
    }),
    filterData((stat) => {
      return stat.millesime === millesime || millesimePart.some((mP) => mP === stat.millesime);
    }),
    // Format data
    transformData((stats) => {
      return {
        ...stats,
        nb_en_emploi_6_mois: stats.nb_sortants_en_emploi_sal_fr_6,
        nb_en_emploi_12_mois: stats.nb_sortants_en_emploi_sal_fr_12,
        nb_en_emploi_18_mois: stats.nb_sortants_en_emploi_sal_fr_18,
        nb_en_emploi_24_mois: stats.nb_sortants_en_emploi_sal_fr_24,
        // On ne garde actuellement que les salaires à 12 mois
        salaire_12_mois_q1: stats.salaire_q1_12,
        salaire_12_mois_q2: stats.salaire_q2_12,
        salaire_12_mois_q3: stats.salaire_q3_12,
        salaire_12_mois_q4: stats.salaire_q4_12,
        nb_poursuite_etudes: stats.nb_poursuivants,
        nb_sortant: stats.nb_sortants,
        nb_annee_term:
          stats.nb_sortants !== null && stats.nb_poursuivants !== null
            ? stats.nb_sortants + stats.nb_poursuivants
            : null,
      };
    }),
    filterData((stats) => stats.diplome)
  );
}

class InserSup {
  constructor(options = {}) {
    this.api = options.api || new DataEnseignementSupApi(options.apiOptions || {});
  }

  async getCertificationsStatsStream(millesime) {
    const certificationsStats = await this.api.fetchCertificationsStats(millesime);
    const results = await mergeApiStats(
      compose(
        Readable.from(certificationsStats),
        filterData(
          (stats) =>
            stats.diplome !== "all" &&
            stats.nationalite === "ensemble" &&
            stats.genre === "ensemble" &&
            stats.obtention_diplome === "ensemble" &&
            stats.regime_inscription === "ensemble"
        )
      ),
      millesime
    );

    return results;
  }
}

export { InserSup };
