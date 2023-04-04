import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { createUAI } from "../../src/common/utils/validationUtils.js";
import { generateCodeCertification, generateStatValue } from "./testUtils.js";
import {
  acceEtablissements,
  bcn,
  certificationsStats,
  formationsStats,
  regionalesStats,
  departementalesStats,
} from "../../src/common/db/collections/collections.js";
import { ALL, getStatsCompute } from "../../src/common/stats.js";

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
        ...getStatsCompute(ALL, () => generateStatValue()),
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
        ...getStatsCompute(ALL, () => generateStatValue()),
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

export function insertDepartementalesStats(custom = {}) {
  return departementalesStats().insertOne(
    merge(
      {},
      {
        departement: {
          code: "75",
          nom: "Paris",
        },
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification: generateCodeCertification("4"),
        code_formation_diplome: createCodeFormationDiplome(),
        diplome: { code: "4", libelle: "BAC" },
        ...getStatsCompute(ALL, () => generateStatValue()),
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
        ...getStatsCompute(ALL, () => generateStatValue()),
        region: { code: "11", nom: "Île-de-France" },
        localisation: {
          code_commune: "75103",
          code_postal: "75003",
          departement: {
            code: "75",
            nom: "Paris",
          },
          nom_commune: "Paris 03ème Arrondissement",
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
        diplome: { code: "4", libelle: "BAC" },
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
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertACCEEtablissements(custom = {}) {
  return acceEtablissements().insertOne(
    merge(
      {},
      {
        numero_uai: faker.helpers.replaceSymbols("########"),
        academie: "11",
        academie_libe: "Montpellier",
        adresse_uai: "15 AVENUE TEST",
        appariement: "SIMILAIRE",
        appellation_officielle: "Lycée test",
        boite_postale_uai: "BP616",
        categorie_financiere: "4",
        categorie_financiere_libe: "4",
        categorie_juridique: "200",
        categorie_juridique_libe: "Etablissement public local d'enseignement (EPLE)",
        code_postal_uai: "34090",
        commune: "34172",
        commune_libe: "Montpellier",
        contrat_etablissement: "99",
        contrat_etablissement_libe: "Sans objet",
        coordonnee_x: "917.9",
        coordonnee_y: "656.4",
        date_derniere_mise_a_jour: new Date("2022-08-30T22:00:00.000Z"),
        date_fermeture: new Date("2022-08-30T22:00:00.000Z"),
        date_geolocalisation: new Date("2022-08-30T22:00:00.000Z"),
        date_ouverture: new Date("2022-08-30T22:00:00.000Z"),
        denomination_principale: "LYCEE PROFESSIONNEL",
        departement_insee_3: "034",
        departement_insee_3_libe: "Hérault",
        etat_etablissement: "4",
        etat_etablissement_libe: "Fermé",
        etat_sirad_uai: "1",
        hebergement_etablissement: "22",
        hebergement_etablissement_libe: "Avec internat et demi-pension",
        localisation: "CENTRE_PARCELLE_PROJETE",
        localite_acheminement_uai: "BELLEGARDE SUR VALSERINE C",
        mel_uai: "email@ac.fr",
        ministere_tutelle: "06",
        ministere_tutelle_libe: "ministère de l'éducation nationale",
        nature_uai: "320",
        nature_uai_libe: "Lycée professionnel",
        niveau_uai: "1",
        niveau_uai_libe: "UAI célibataire",
        numero_siren_siret_uai: "19000000000000",
        numero_telecopieur_uai: "01 00 00 00 00",
        numero_telephone_uai: "01 00 00 00 00",
        patronyme_uai: "BRILLAT SAVARIN",
        pays: "100",
        pays_libe: "France",
        secteur_public_prive: "PU",
        secteur_public_prive_libe: "Public",
        sigle_uai: "LP",
        situation_comptable: "3",
        situation_comptable_libe: "Rattaché à une agence comptable",
        source: "IGN",
        type_uai: "LP",
        type_uai_libe: "Lycées professionnels",
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}
