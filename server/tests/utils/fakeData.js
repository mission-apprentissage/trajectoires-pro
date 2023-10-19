import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { createUAI } from "#src/common/utils/validationUtils.js";
import { generateCodeCertification, generateStatValue } from "./testUtils.js";
import {
  bcn,
  certificationsStats,
  formationsStats,
  regionalesStats,
  metrics,
  bcnMef,
  cfdMetiers,
  cfdRomes,
  romeMetier,
  rome,
} from "#src/common/db/collections/collections.js";
import { ALL, getStatsCompute } from "#src/common/stats.js";

export function createCodeFormationDiplome() {
  return faker.helpers.replaceSymbols("4#######");
}

export function createCodeRome() {
  return faker.helpers.replaceSymbols("A####");
}

export function insertCertificationsStats(custom = {}, withStat = true) {
  const code_certification = custom?.code_certification || generateCodeCertification("4");
  return certificationsStats().insertOne(
    merge(
      {},
      {
        millesime: "2020",
        code_certification: code_certification,
        code_formation_diplome: createCodeFormationDiplome(),
        libelle: "LIBELLE",
        diplome: { code: "4", libelle: "BAC" },
        filiere: "apprentissage",
        ...(withStat ? getStatsCompute(ALL, () => generateStatValue()) : {}),
        donnee_source: {
          code_certification,
          type: "self",
        },
        _meta: {
          date_import: new Date(),
          created_on: new Date(),
          updated_on: new Date(),
        },
      },
      custom
    )
  );
}

export function insertRegionalesStats(custom = {}, withStat = true) {
  const code_certification = custom?.code_certification || generateCodeCertification("4");
  return regionalesStats().insertOne(
    merge(
      {},
      {
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification,
        code_formation_diplome: createCodeFormationDiplome(),
        libelle: "LIBELLE",
        diplome: { code: "4", libelle: "BAC" },
        ...(withStat ? getStatsCompute(ALL, () => generateStatValue()) : {}),
        donnee_source: {
          code_certification,
          type: "self",
        },
        _meta: {
          date_import: new Date(),
          created_on: new Date(),
          updated_on: new Date(),
        },
      },
      custom
    )
  );
}

export function insertFormationsStats(custom = {}, withStat = true) {
  const code_certification = custom?.code_certification || generateCodeCertification("4");
  return formationsStats().insertOne(
    merge(
      {},
      {
        uai: createUAI(faker.helpers.replaceSymbols("075####")),
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification,
        code_formation_diplome: createCodeFormationDiplome(),
        libelle: "LIBELLE",
        diplome: { code: "4", libelle: "BAC" },
        ...(withStat ? getStatsCompute(ALL, () => generateStatValue()) : {}),
        region: { code: "11", nom: "Île-de-France" },
        donnee_source: {
          code_certification,
          type: "self",
        },
        _meta: {
          date_import: new Date(),
          created_on: new Date(),
          updated_on: new Date(),
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
        libelle_long: "BAC PRO BATIMENT",
        diplome: { code: "4", libelle: "BAC" },
        date_ouverture: new Date(),
        ancien_diplome: [],
        nouveau_diplome: [],
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
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
        libelle_long: "BAC PRO BATIMENT",
        date_ouverture: new Date(),
        ancien_diplome: [],
        nouveau_diplome: [],
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertBCNMEF(custom = {}) {
  const mef_stat_11 = custom?.mef_stat_11 || faker.helpers.replaceSymbols("###########");
  return bcnMef().insertOne(
    merge(
      {},
      {
        mef_stat_11: mef_stat_11,
        mef: faker.helpers.replaceSymbols("##########"),
        dispositif_formation: faker.helpers.replaceSymbols("###"),
        formation_diplome: createCodeFormationDiplome(),
        duree_dispositif: "0",
        annee_dispositif: "0",

        libelle_court: "BAC PRO",
        libelle_long: "BAC PRO BATIMENT",

        date_ouverture: new Date(),
        date_fermeture: new Date(),

        statut_mef: "4",
        nb_option_obligatoire: "1",
        nb_option_facultatif: "1",
        renforcement_langue: "N",
        duree_projet: "1",
        duree_stage: "1",
        horaire: "N",
        mef_inscription_scolarite: "N",
        mef_stat_9: mef_stat_11.substr(0, 9),

        date_intervention: new Date(),
        libelle_edition: "libelle edition",
        commentaire: "commentaire",
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertMetrics(custom = {}) {
  return metrics().insertOne(
    merge(
      {},
      {
        time: new Date(),
        consumer: "localhost",
        url: "/api/",
      },
      custom
    )
  );
}

export function insertRome(custom = {}) {
  return rome().insertOne(
    merge(
      {},
      {
        code_rome: createCodeRome(),
        code_ogr: 30,
        libelle: "Polyculture, élevage",
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertRomeMetier(custom = {}) {
  return romeMetier().insertOne(
    merge(
      {},
      {
        code_rome: createCodeRome(),
        title: "Céréalier / Céréalière",
        isMetierAvenir: true,
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertCfdRomes(custom = {}) {
  return cfdRomes().insertOne(
    merge(
      {},
      {
        code_formation_diplome: createCodeFormationDiplome(),
        code_romes: [createCodeRome()],
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertCfdMetiers(custom = {}) {
  const code_romes = custom?.code_romes || [createCodeRome()];
  return cfdMetiers().insertOne(
    merge(
      {},
      {
        code_formation_diplome: createCodeFormationDiplome(),
        code_romes,
        metiers: [
          {
            code_rome: code_romes[0],
            title: "Céréalier / Céréalière",
            isMetierAvenir: true,
          },
        ],
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}
