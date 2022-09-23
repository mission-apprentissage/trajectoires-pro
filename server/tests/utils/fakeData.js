import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { createUAI } from "../../src/common/utils/validationUtils.js";
import { generateCodeCertification, generateStatValue } from "./testUtils.js";
import {
  bcn,
  certificationsStats,
  formationsStats,
  regionalesStats,
} from "../../src/common/db/collections/collections.js";
import { ALL, getStats } from "../../src/common/stats.js";

function createCodeFormationDiplome() {
  return faker.helpers.replaceSymbols("4#######");
}

export function insertCertificationsStats(custom = {}) {
  return certificationsStats().insertOne(
    merge(
      {},
      {
        millesime: "2020",
        code_certification: generateCodeCertification("4"),
        code_formation_diplome: createCodeFormationDiplome(),
        diplome: { code: "4", libelle: "BAC" },
        filiere: "apprentissage",
        ...getStats(ALL, () => generateStatValue()),
        _meta: {
          date_import: new Date(),
        },
      },
      custom
    )
  );
}

export function insertRegionalesStats(custom = {}) {
  return regionalesStats().insertOne(
    merge(
      {},
      {
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification: generateCodeCertification("4"),
        code_formation_diplome: createCodeFormationDiplome(),
        diplome: { code: "4", libelle: "BAC" },
        ...getStats(ALL, () => generateStatValue()),
        _meta: {
          date_import: new Date(),
        },
      },
      custom
    )
  );
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
        code_formation_diplome: createCodeFormationDiplome(),
        diplome: { code: "4", libelle: "BAC" },
        ...getStats(ALL, () => generateStatValue()),
        region: { code: "11", nom: "Île-de-France" },
        _meta: {
          date_import: new Date(),
        },
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
