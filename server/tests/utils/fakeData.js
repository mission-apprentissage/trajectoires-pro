import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { dbCollection } from "../../src/common/mongodb.js";
import { createUAI } from "../../src/common/utils/validationUtils.js";

function randomStats() {
  return parseInt(faker.random.numeric(2));
}

export function insertFormationsStats(custom = {}) {
  return dbCollection("formationsStats").insertOne(
    merge(
      {},
      {
        uai: createUAI(faker.helpers.replaceSymbols("075####")),
        code_formation: faker.helpers.replaceSymbols("########"),
        millesime: "2018_2019",
        filiere: "apprentissage",
        nb_annee_term: randomStats(),
        nb_en_emploi_12_mois: randomStats(),
        nb_en_emploi_6_mois: randomStats(),
        nb_poursuite_etudes: randomStats(),
        nb_sortant: randomStats(),
        taux_emploi_12_mois: randomStats(),
        taux_emploi_6_mois: randomStats(),
        taux_poursuite_etudes: randomStats(),
        _meta: {
          date_import: new Date(),
        },
      },
      custom
    )
  );
}

export function insertCertificationsStats(custom = {}) {
  return dbCollection("certificationsStats").insertOne(
    merge(
      {},
      {
        millesime: "2020",
        code_formation: faker.helpers.replaceSymbols("########"),
        filiere: "apprentissage",
        nb_annee_term: randomStats(),
        nb_poursuite_etudes: randomStats(),
        nb_en_emploi_12_mois: randomStats(),
        nb_en_emploi_6_mois: randomStats(),
        taux_poursuite_etudes: randomStats(),
        taux_emploi_12_mois: randomStats(),
        taux_emploi_6_mois: randomStats(),
        taux_rupture_contrats: randomStats(),
      },
      custom
    )
  );
}
