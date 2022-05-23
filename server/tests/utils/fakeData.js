import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { createUAI } from "../../src/common/utils/validationUtils.js";
import { certificationsStats, certifications, formationsStats } from "../../src/common/collections/index.js";
import { generateCodeFormation, generateStats } from "./testUtils.js";

export function insertFormationsStats(custom = {}) {
  return formationsStats().insertOne(
    merge(
      {},
      {
        uai: createUAI(faker.helpers.replaceSymbols("075####")),
        code_formation: generateCodeFormation(),
        millesime: "2018_2019",
        filiere: "apprentissage",
        nb_annee_term: generateStats(),
        nb_en_emploi_12_mois: generateStats(),
        nb_en_emploi_6_mois: generateStats(),
        nb_poursuite_etudes: generateStats(),
        nb_sortant: generateStats(),
        taux_emploi_12_mois: generateStats(),
        taux_emploi_6_mois: generateStats(),
        taux_poursuite_etudes: generateStats(),
        _meta: {
          date_import: new Date(),
        },
      },
      custom
    )
  );
}

export function insertCertificationsStats(custom = {}) {
  return certificationsStats().insertOne(
    merge(
      {},
      {
        millesime: "2020",
        code_formation: generateCodeFormation(),
        filiere: "apprentissage",
        nb_annee_term: generateStats(),
        nb_poursuite_etudes: generateStats(),
        nb_en_emploi_12_mois: generateStats(),
        nb_en_emploi_6_mois: generateStats(),
        taux_poursuite_etudes: generateStats(),
        taux_emploi_12_mois: generateStats(),
        taux_emploi_6_mois: generateStats(),
        taux_rupture_contrats: generateStats(),
      },
      custom
    )
  );
}

export function insertCertifications(custom = {}) {
  return certifications().insertOne(
    merge(
      {},
      {
        code_formation: generateCodeFormation(),
        alias: [],
        diplome: { code: "4", label: "BAC" },
        _meta: { date_import: new Date() },
      },
      custom
    )
  );
}
