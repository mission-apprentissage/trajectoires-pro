import { Readable } from "stream";
import { mapValues } from "lodash-es";
import { DataEnseignementSupApi } from "./DataEnseignementSupApi.js";
import { transformData, filterData, accumulateData, flattenArray, oleoduc, writeData } from "oleoduc";

class InserSup {
  constructor(options = {}) {
    this.api = options.api || new DataEnseignementSupApi(options.apiOptions || {});
  }

  async getEtablissements() {
    const etablissements = await this.api.fetchEtablissements();
    return etablissements;
  }

  async getFormationsStatsStream(uai, millesime) {
    let results = [];
    const millesimePart = millesime.split("_");

    const etablissementStats = await this.api.fetchEtablissementStats(uai);

    await oleoduc(
      Readable.from(etablissementStats),
      filterData((stats) => stats.diplome !== "all"),
      // We only keep promo matching one of the millesime's year
      filterData((stats) => {
        return stats.promo.every((p) => millesimePart.some((m) => m === p));
      }),
      // Format data
      transformData((stats) => {
        const transformations = {
          nb_poursuivants: (s) => parseInt(s),
          nb_sortants: (s) => parseInt(s),
          taux_emploi_sal_fr: (s) => (s === "nd" ? null : parseFloat(s)),
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
        const statsByMillesime = stats.reduce((acc, stat) => {
          acc[stat.promo.join("_")] = acc[stat.promo.join("_")] ?? {
            ...stat,
            millesime: stat.promo.join("_"),
            nb_diplomes: stat.nb_sortants + stat.nb_poursuivants,
            nb_en_emploi: {},
          };

          const labelToMonth = stat.date_inser_long.match(/([0-9]+) mois après le diplôme/)[1];
          const nb_en_emploi =
            stat.taux_emploi_sal_fr !== null ? Math.round((stat.taux_emploi_sal_fr / 100) * stat.nb_sortants) : null;
          acc[stat.promo.join("_")].nb_en_emploi[`nb_en_emploi_${labelToMonth}_mois`] = nb_en_emploi;

          return acc;
        }, {});
        return statsByMillesime;
      }),
      // Aggregate two millesimes
      transformData((stats) => {
        return Object.values(stats).filter((stats) => {
          return (
            stats.millesime === millesime ||
            stats.millesime === millesimePart[0] ||
            stats.millesime === millesimePart[1]
          );
        });
      }),
      flattenArray(),
      // Format data
      transformData((stats) => {
        return {
          ...stats,
          ...stats.nb_en_emploi,
        };
      }),
      writeData((stats) => {
        results.push(stats);
      })
    );

    return results;
  }
}

export { InserSup };
