import { isNil, mapValues, flow, merge, omit } from "lodash-es";
import { transformData } from "oleoduc";
import { $field, $percentage, $removeNullOrZero, $removeWhenAllNull } from "./utils/mongodbUtils.js";
import { percentage } from "./utils/numberUtils.js";
import config from "#src/config.js";

export const INSERJEUNES_STATS_NAMES = [
  "nb_annee_term",
  "nb_en_emploi_24_mois",
  "nb_en_emploi_18_mois",
  "nb_en_emploi_12_mois",
  "nb_en_emploi_6_mois",
  "nb_poursuite_etudes",
  "nb_sortant",
  "taux_rupture_contrats",
];
export const INSERJEUNES_IGNORED_STATS_NAMES = [
  "taux_poursuite_etudes",
  "taux_emploi_24_mois",
  "taux_emploi_18_mois",
  "taux_emploi_12_mois",
  "taux_emploi_6_mois",
  "DEVENIR_part_autre_situation_6_mois",
  "DEVENIR_part_en_emploi_6_mois",
  "DEVENIR_part_poursuite_etudes",
];

export const INSERSUP_STATS_NAMES = [
  "nb_annee_term",
  "nb_en_emploi_24_mois",
  "nb_en_emploi_18_mois",
  "nb_en_emploi_12_mois",
  "nb_en_emploi_6_mois",
  "nb_poursuite_etudes",
  "nb_sortant",
  "nb_diplome",
];
export const INSERSUP_META = [
  "etablissement_libelle",
  "etablissement_actuel_libelle",
  "type_diplome",
  "domaine_disciplinaire",
  "secteur_disciplinaire",
  "discipline",
];

export const CUSTOM_STATS_NAMES = [
  "taux_en_formation",
  "taux_en_emploi_24_mois",
  "taux_en_emploi_18_mois",
  "taux_en_emploi_12_mois",
  "taux_en_emploi_6_mois",
  "taux_autres_6_mois",
  "taux_autres_12_mois",
  "taux_autres_18_mois",
  "taux_autres_24_mois",
];

export const ALL = /.*/;
export const TAUX = /^taux_.*$/;
export const VALEURS = /^nb_.*$/;

export function getMillesimes() {
  return config.millesimes.default;
}

export function getLastMillesimes() {
  return config.millesimes.default[config.millesimes.default.length - 1];
}

export function getMillesimesFormations() {
  return config.millesimes.formations;
}

export function getMillesimesFormationsSup() {
  return config.millesimes.formationsSup;
}

export function getLastMillesimesFormations() {
  return config.millesimes.formations[config.millesimes.formations.length - 1];
}

export function getLastMillesimesFormationsSup() {
  return config.millesimes.formationsSup[config.millesimes.formationsSup.length - 1];
}

export function getLastMillesimesFormationsFor(filiere) {
  return filiere === "superieur" ? getLastMillesimesFormationsSup() : getLastMillesimesFormations();
}

export function getLastMillesimesFormationsYearFor(filiere) {
  const millesime = filiere === "superieur" ? getLastMillesimesFormationsSup() : getLastMillesimesFormations();
  return millesime.split("_")[1];
}

export function getMillesimeFormationsFrom(millesime) {
  return `${parseInt(millesime) - 1}_${millesime}`;
}

export function getMillesimeFormationsYearFrom(millesime) {
  return millesime.split("_")[1];
}

export function getMillesimesRegionales() {
  return config.millesimes.regionales;
}

export function getLastMillesimesRegionales() {
  return config.millesimes.regionales[config.millesimes.regionales.length - 1];
}

export function isMillesimesYearSingle(millesime) {
  return millesime.split("_").length === 1 ? true : false;
}

function divide({ dividend, divisor }) {
  return {
    compute: (data) => percentage(data[dividend], data[divisor]),
    aggregate: () => $removeNullOrZero($field(divisor), $percentage($field(dividend), $field(divisor))),
  };
}

function percentageAndSubtract({ dividends, divisor, minuend }) {
  return {
    compute: (data) => {
      const sum = dividends.reduce((s, d) => {
        return s + percentage(data[d], data[divisor]);
      }, 0);
      return Math.max(minuend - sum, 0);
    },

    aggregate: () => {
      return $removeWhenAllNull(
        dividends.map((d) => $field(d)),
        $removeNullOrZero($field(divisor), {
          $max: [
            0,
            { $subtract: [minuend, { $sum: [...dividends.map((d) => $percentage($field(d), $field(divisor)))] }] },
          ],
        }),
        null
      );
    },
  };
}

export function getReglesDeCalcul() {
  return {
    taux_en_emploi_24_mois: divide({ dividend: "nb_en_emploi_24_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_18_mois: divide({ dividend: "nb_en_emploi_18_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_12_mois: divide({ dividend: "nb_en_emploi_12_mois", divisor: "nb_annee_term" }),
    taux_en_emploi_6_mois: divide({ dividend: "nb_en_emploi_6_mois", divisor: "nb_annee_term" }),
    taux_en_formation: divide({ dividend: "nb_poursuite_etudes", divisor: "nb_annee_term" }),
    taux_autres_6_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_6_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
    taux_autres_12_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_12_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
    taux_autres_18_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_18_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
    taux_autres_24_mois: percentageAndSubtract({
      dividends: ["nb_en_emploi_24_mois", "nb_poursuite_etudes"],
      divisor: ["nb_annee_term"],
      minuend: 100,
    }),
  };
}

export function filterStatsNames(regex = ALL) {
  return [...INSERJEUNES_STATS_NAMES, ...CUSTOM_STATS_NAMES].sort().filter((k) => regex.test(k));
}

export function getStats(regex, mapValue) {
  return filterStatsNames(regex).reduce((acc, statName) => {
    const value = mapValue(statName);
    return {
      ...acc,
      ...(value ? { [statName]: value } : {}),
    };
  }, {});
}

export function getStatsCompute(regex, mapValue) {
  return filterStatsNames(regex).reduce((acc, statName) => {
    const value = mapValue(statName);
    return {
      ...acc,
      ...(isNaN(value) || isNil(value) ? {} : { [statName]: value }),
    };
  }, {});
}

export function computeCustomStats(data) {
  const type = data === "aggregate" ? "aggregate" : "compute";
  const regles = getReglesDeCalcul();

  if (type === "compute") {
    return getStatsCompute(TAUX, (statName) => {
      const regle = regles[statName];
      const result = regle?.[type]?.(data);
      return isNaN(result) || isNil(result) ? null : result;
    });
  }

  return getStats(TAUX, (statName) => {
    const regle = regles[statName];
    return regle?.[type]?.(data) || null;
  });
}

export function buildDescriptionFiliere(pro, apprentissage) {
  const validFiliere = pro || apprentissage;

  const cfds = [
    ...new Set([...(pro?.codes_formation_diplome || []), ...(apprentissage?.codes_formation_diplome || [])]),
  ].sort();
  const descriptionFiliere = [
    ...(pro ? [`${pro.diplome?.libelle || ""} filière ${pro.filiere}`.trim()] : []),
    ...(apprentissage ? [`${apprentissage.diplome?.libelle || ""} filière ${apprentissage.filiere}`.trim()] : []),
  ];
  const certificationText = cfds.length === 1 ? "la certification" : "les certifications";
  return {
    titre:
      cfds.length === 1 ? `Certification ${validFiliere.code_formation_diplome}` : `Certifications ${cfds.join(", ")}`,
    details: `Données InserJeunes pour ${certificationText} ${cfds.join(", ")} (${descriptionFiliere.join(
      " et "
    )}) pour le millésime ${validFiliere.millesime}${
      validFiliere.region ? ` et la région ${validFiliere.region.nom}` : ""
    }`,
  };
}

export function buildDescription(stats) {
  const { code_certification, filiere, uai, millesime, diplome, region } = stats;

  return {
    titre: `Certification ${code_certification}${uai ? `, établissement ${uai}` : ""}`,
    details:
      `Données ${filiere === "superieur" ? "InserSup" : "InserJeunes"} pour la certification ${code_certification} (${
        diplome.libelle
      } filière ${filiere})` +
      `${uai ? ` dispensée par l'établissement ${uai},` : ""} pour le millésime ${millesime}${
        !uai && region ? ` et la région ${region.nom}` : ""
      }`,
  };
}

function transformDisplayStatRules() {
  const rules = [
    // Filtre les _id et les _meta
    {
      cond: (data) => data,
      transformation: (data) => omit(data, "_id", "_meta"),
      message: (data) => data,
    },
    {
      // Ajout du booléen de fermeture d'une formation
      cond: (data) => data && (!data?.codes_formation_diplome || data.codes_formation_diplome.length === 1),
      transformation: (data) => {
        return { ...data, formation_fermee: data.date_fermeture && data.date_fermeture < new Date() ? true : false };
      },
      message: (data) => data,
    },
    {
      // Remplace les taux par null si le nbr en année terminales < 20
      cond: (data) => data && data.nb_annee_term < 20,
      transformation: (data) => mapValues(data, (o, k) => (TAUX.test(k) ? null : o)),
      message: (data) =>
        merge(data, {
          _meta: {
            messages: [
              `Les taux ne peuvent pas être affichés car il n'y a pas assez d'élèves pour fournir une information fiable.`,
            ],
          },
        }),
    },
    {
      // Ajoute un message de précision dans le cas ou l'UAI établissements est différents de celui de provenance des données
      cond: (data) => data?.uai && data.uai_type !== data.uai_donnee_type,
      transformation: (data) => data,
      message: (data) => {
        const messageByType = {
          gestionnaire: `Les données pour cette formation proviennent de l'organisme gestionnaire de la formation.`,
          formateur: `Les données pour cette formation proviennent de l'organisme formateur de la formation.`,
          lieu_formation: `Les données pour cette formation proviennent du lieu de formation de la formation.`,
          inconnu: `Nous ne pouvons pas déterminer si les données pour cette formation proviennent de l'organisme gestionnaire, de l'organisme formateur ou du lieu de formation`,
        };

        return merge(data, {
          _meta: {
            messages: [messageByType[data.uai_donnee_type]],
          },
        });
      },
    },
  ];

  return rules;
}

export function transformDisplayStat(isStream = false) {
  const ruleToFunc = ({ cond, transformation, message }) => {
    return (data) => (cond(data) ? flow(transformation, message)(data) : data);
  };
  const rules = transformDisplayStatRules().map(ruleToFunc);

  if (!isStream) {
    return flow(rules);
  }
  return transformData((data) => flow(rules)(data));
}
