import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { createUAI } from "../../src/common/utils/validationUtils.js";
import { generateCodeCertification, generateStats } from "./testUtils.js";
import { certificationsStats, bcn, formationsStats } from "../../src/common/db/collections/collections.js";

function createCodeFormationDiplome() {
  return faker.helpers.replaceSymbols("4#######");
}

export function insertFormationsStats(custom = {}) {
  return formationsStats().insertOne(
    merge(
      {},
      {
        uai: createUAI(faker.helpers.replaceSymbols("075####")),
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification: generateCodeCertification("4"),
        diplome: { code: "4", libelle: "BAC" },
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
        code_certification: generateCodeCertification("4"),
        diplome: { code: "4", libelle: "BAC" },
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

export function insertCFD(custom = {}) {
  return bcn().insertOne(
    merge(
      {},
      {
        type: "cfd",
        code_certification: createCodeFormationDiplome(),
        code_formation_diplome: createCodeFormationDiplome(),
        libelle: "BAC PRO BATIMENT",
        diplome: { code: "4", libelle: "BAC" },
        _meta: { date_import: new Date() },
      },
      custom
    )
  );
}

export function insertMEF(custom = {}) {
  return bcn().insertOne(
    merge(
      {},
      {
        type: "mef",
        code_certification: faker.helpers.replaceSymbols("###########"),
        code_formation_diplome: createCodeFormationDiplome(),
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        diplome: { code: "4", libelle: "BAC" },
        libelle: "BAC PRO",
        _meta: { date_import: new Date() },
      },
      custom
    )
  );
}
