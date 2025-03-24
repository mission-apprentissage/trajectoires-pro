import { Readable } from "stream";
import { mapValues, merge, isEqual, pick, pickBy } from "lodash-es";
import { DataEnseignementSupApi } from "./DataEnseignementSupApi.js";
import { compose, transformData, filterData, accumulateData, flattenArray } from "oleoduc";

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
      const formatNd = (parser) => (s) => s === null || s === "nd" ? null : parser(s);

      const transformations = {
        nb_poursuivants: formatNd(parseInt),
        nb_sortants: formatNd(parseInt),
        tx_sortants_en_emploi_sal_fr: formatNd(parseFloat),
        nb_sortants_en_emploi_sal_fr: formatNd(parseInt),
        salaire_q1: formatNd(parseInt),
        salaire_q2: formatNd(parseInt),
        salaire_q3: formatNd(parseInt),
      };
      return mapValues(stats, (s, key) => {
        return transformations[key] ? transformations[key](s) : s;
      });
    }),
    // Accumulate by diplome
    accumulateData(
      (acc, stats) => {
        const diplome = stats.diplome;
        if (!acc[diplome]) {
          acc[diplome] = [];
        }
        acc[diplome].push(stats);

        return acc;
      },
      { accumulator: {} }
    ),
    transformData((d) => Object.values(d)),
    flattenArray(),
    // Group by millesime
    transformData((stats) => {
      const domaineKey = ["dom", "discipli", "sectdis"];
      const statsByMillesime = stats.reduce((acc, stat) => {
        acc[stat.promo.join("_")] = acc[stat.promo.join("_")] ?? {
          ...pick(stat, domaineKey),
          millesime: stat.promo.join("_"),
          nb_en_emploi: {},
          salaire: {},
        };

        // Un même code SISE peut être dans plusieurs domaine
        // On prend le premier (TODO: gérer les domaines)
        if (!isEqual(pick(acc[stat.promo.join("_")], domaineKey), pick(stat, domaineKey))) {
          return acc;
        }

        acc[stat.promo.join("_")] = merge(acc[stat.promo.join("_")], {
          ...stat,
          nb_annee_term:
            stat.nb_sortants !== null && stat.nb_poursuivants !== null ? stat.nb_sortants + stat.nb_poursuivants : null,
        });

        const labelToMonth = stat.date_inser_long.match(/([0-9]+) mois après le diplôme/)[1];
        acc[stat.promo.join("_")].nb_en_emploi[`nb_en_emploi_${labelToMonth}_mois`] = stat.nb_sortants_en_emploi_sal_fr;

        // Salaire
        acc[stat.promo.join("_")].salaire[`salaire_${labelToMonth}_mois_q1`] = stat.salaire_q1;
        acc[stat.promo.join("_")].salaire[`salaire_${labelToMonth}_mois_q2`] = stat.salaire_q2;
        acc[stat.promo.join("_")].salaire[`salaire_${labelToMonth}_mois_q3`] = stat.salaire_q3;

        return acc;
      }, {});
      return statsByMillesime;
    }),
    transformData((statsByMillesime) => {
      return Object.values(statsByMillesime).filter((stats) => {
        return stats.millesime === millesime || millesimePart.some((mP) => mP === stats.millesime);
      });
    }),
    flattenArray(),
    // Format data
    transformData((stats) => {
      return {
        ...stats,
        ...stats.nb_en_emploi,
        // On ne garde actuellement que les salaires à 12 mois
        ...pickBy(stats.salaire, (_, key) => key.match(/salaire_12_mois/)),
        nb_poursuite_etudes: stats.nb_poursuivants,
        nb_sortant: stats.nb_sortants,
        nb_annee_term: stats.nb_annee_term,
      };
    }),
    filterData((stats) => stats.diplome)
  );
}

class InserSup {
  constructor(options = {}) {
    this.api = options.api || new DataEnseignementSupApi(options.apiOptions || {});
  }

  async getEtablissements() {
    const etablissements = await this.api.fetchEtablissements();
    return etablissements;
  }

  async getFormationsStatsStream(uai, millesime) {
    const etablissementStats = await this.api.fetchEtablissementStats(uai);
    return mergeApiStats(
      compose(
        Readable.from(etablissementStats),
        filterData(
          (stats) =>
            stats.diplome !== "all" &&
            stats.nationalite === "ensemble" &&
            stats.genre === "ensemble" &&
            stats.obtention_diplome === "ensemble"
        )
      ),
      millesime
    );
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
            stats.obtention_diplome === "ensemble"
        )
      ),
      millesime
    );

    return results;
  }
}

export { InserSup };
