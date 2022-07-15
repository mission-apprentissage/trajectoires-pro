import { statsSchema } from "./db/collections/jsonSchema/statsSchema.js";
import { $computeTauxStats, $sumValeursStats } from "./utils/mongodbUtils.js";
import { omitNil } from "./utils/objectUtils.js";

export const ALL = /.*/;
export const TAUX = /^taux_.*$/;
export const VALEURS = /^nb_.*$/;

export function getMillesimes() {
  return ["2018_2019", "2019_2020"];
}

export function getTauxReglesDeCalcul(custom = {}) {
  return {
    taux_emploi_24_mois: { dividend: "nb_en_emploi_24_mois", divisor: "nb_annee_term" },
    taux_emploi_18_mois: { dividend: "nb_en_emploi_18_mois", divisor: "nb_annee_term" },
    taux_emploi_12_mois: { dividend: "nb_en_emploi_12_mois", divisor: "nb_annee_term" },
    taux_emploi_6_mois: { dividend: "nb_en_emploi_6_mois", divisor: "nb_annee_term" },
    taux_poursuite_etudes: { dividend: "nb_poursuite_etudes", divisor: "nb_annee_term" },
    ...custom,
  };
}

export function getStatsNames(regex = ALL) {
  return Object.keys(statsSchema())
    .sort()
    .filter((k) => regex.test(k));
}

export function reduceStats(regex, converter) {
  return getStatsNames(regex).reduce((acc, statName) => {
    const value = converter(statName);
    return {
      ...acc,
      ...(value ? { [statName]: value } : {}),
    };
  }, {});
}

export function computeTauxStats(callback) {
  const regles = getTauxReglesDeCalcul();
  return reduceStats(TAUX, (statName) => {
    const regle = regles[statName];
    return regle ? callback(regle) : null;
  });
}

export function buildDescription(stats) {
  const { code_certification, filiere, uai, millesime, diplome } = stats;
  return {
    titre: `Certification ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    details:
      `Données InserJeunes pour la certification ${code_certification} (${diplome.libelle} filière ${filiere})` +
      `${uai ? ` dispensée par l'établissement ${uai},` : ""} pour le millesime ${millesime}`,
  };
}

export async function getFilieresStats(collection, cfd, millesime) {
  const results = await collection
    .aggregate([
      {
        $match: { code_formation_diplome: cfd, ...(millesime ? { millesime } : {}) },
      },
      {
        $group: {
          _id: { filiere: "$filiere", millesime: "$millesime" },
          codes_certifications: { $addToSet: "$code_certification" },
          code_formation_diplome: { $first: "$code_formation_diplome" },
          filiere: { $first: "$filiere" },
          millesime: { $first: "$millesime" },
          diplome: { $first: "$diplome" },
          ...$sumValeursStats(),
        },
      },
      {
        $addFields: {
          ...$computeTauxStats(),
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $group: {
          _id: "$millesime",
          stats: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ])
    .limit(1)
    .toArray();

  return omitNil({
    pro: results[0]?.stats?.find((s) => s.filiere === "pro"),
    apprentissage: results[0]?.stats?.find((s) => s.filiere === "apprentissage"),
  });
}
