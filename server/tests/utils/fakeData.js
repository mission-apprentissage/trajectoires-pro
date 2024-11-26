import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import
import { merge } from "lodash-es";
import { createUAI } from "#src/common/utils/validationUtils.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { generateCodeCertification, generateStatValue } from "./testUtils.js";
import {
  bcn,
  certificationsStats,
  formationsStats,
  regionalesStats,
  metrics,
  bcnMef,
  bcnSise,
  cfdMetiers,
  cfdRomes,
  romeMetier,
  rome,
  acceEtablissements,
  users,
  CAFormations,
} from "#src/common/db/collections/collections.js";
import { ALL, getStatsCompute } from "#src/common/stats.js";
import { hashPassword } from "#src/services/auth/auth.js";
import { ObjectId } from "mongodb";

export function createCodeFormationDiplome() {
  return faker.helpers.replaceSymbols("4#######");
}

export function createCodeRome() {
  return faker.helpers.replaceSymbols("A####");
}

export function insertCertificationsStats(custom = {}, withStat = true) {
  const code_certification = custom?.code_certification || generateCodeCertification("4");
  const code_certification_type =
    code_certification.length === 11 ? "mef11" : code_certification.length === 7 ? "sise" : "cfd";

  return certificationsStats().insertOne(
    merge(
      {},
      {
        millesime: "2020",
        code_certification: code_certification,
        code_certification_type,
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
  const code_certification_type =
    code_certification.length === 11 ? "mef11" : code_certification.length === 7 ? "sise" : "cfd";

  return regionalesStats().insertOne(
    merge(
      {},
      {
        region: { code: "11", nom: "Île-de-France" },
        millesime: "2018_2019",
        filiere: "apprentissage",
        code_certification,
        code_certification_type,
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
  const code_certification_type =
    code_certification.length === 11 ? "mef11" : code_certification.length === 7 ? "sise" : "cfd";

  return formationsStats().insertOne(
    omitNil(
      merge(
        {},
        {
          uai: createUAI(faker.helpers.replaceSymbols("075####")),
          libelle_etablissement: "Lycée",
          millesime: "2018_2019",
          filiere: "apprentissage",
          code_certification,
          code_certification_type,
          code_formation_diplome: createCodeFormationDiplome(),
          libelle: "LIBELLE",
          diplome: { code: "4", libelle: "BAC" },
          ...(withStat ? getStatsCompute(ALL, () => generateStatValue()) : {}),
          region: { code: "11", nom: "Île-de-France" },
          academie: {
            code: "01",
            nom: "Paris",
          },
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

export function insertAcceEtablissement(custom = {}) {
  return acceEtablissements().insertOne(
    merge(
      {},
      {
        numero_uai: faker.helpers.replaceSymbols("########"),
        academie: "10",
        academie_libe: "Lyon",
        adresse_uai: "15 AVENUE SAINT EXUPERY",
        appariement: "SIMILAIRE",
        appellation_officielle: "Lycée professionnel",
        boite_postale_uai: "BP",
        categorie_financiere: "4",
        categorie_financiere_libe: "4",
        categorie_juridique: "200",
        categorie_juridique_libe: "Etablissement public local d'enseignement (EPLE)",
        code_postal_uai: "69001",
        commune: "69001",
        commune_libe: "Lyon",
        contrat_etablissement: "99",
        contrat_etablissement_libe: "Sans objet",
        coordonnee_x: "1.1",
        coordonnee_y: "1.1",
        denomination_principale: "LYCEE PROFESSIONNEL",
        departement_insee_3: "069",
        departement_insee_3_libe: "Rhône",
        etat_etablissement: "1",
        etat_etablissement_libe: "Ouvert",
        etat_sirad_uai: "1",
        hebergement_etablissement: "22",
        hebergement_etablissement_libe: "Avec internat et demi-pension",
        localisation: "LOCALISATION",
        localite_acheminement_uai: "LOCALITE UAI",
        mel_uai: "email@email.fr",
        ministere_tutelle: "06",
        ministere_tutelle_libe: "ministère de l'éducation nationale",
        nature_uai: "320",
        nature_uai_libe: "Lycée professionnel",
        niveau_uai: "1",
        niveau_uai_libe: "UAI célibataire",
        numero_siren_siret_uai: "19000000000000",
        numero_telecopieur_uai: "01 02 03 04 05",
        numero_telephone_uai: "01 02 03 04 05",
        patronyme_uai: "PATRONYME",
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
        date_derniere_mise_a_jour: new Date(),
        date_fermeture: new Date(),
        date_geolocalisation: new Date(),
        date_ouverture: new Date(),
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

export function insertBCNSise(custom = {}) {
  const diplome_sise = custom?.diplome_sise || faker.helpers.replaceSymbols("#######");
  return bcnSise().insertOne(
    merge(
      {},
      {
        diplome_sise: diplome_sise,
        type_diplome_sise: "XD",
        libelle_intitule_1: "METIERS DE L'ENSEIGNEMENT",
        libelle_intitule_2: "METIERS DE L'ENSEIGNEMENT 2",
        groupe_specialite: "333",
        lettre_specialite: "T",
        secteur_disciplinaire_sise: "34",
        cite_domaine_formation: "141",
        date_ouverture: new Date(),
        date_fermeture: new Date(),
        date_intervention: new Date(),
        definitif: "0",
        cite_domaine_detaille: "0110",
        secteur_discipl_detail_sise: "34",
        diplome: {
          code: "6",
          libelle: "MAST ENS",
        },
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

export function insertCAFormation(custom = {}) {
  return CAFormations().insertOne(
    merge(
      {},
      {
        id: new ObjectId(),
        cfd: createCodeFormationDiplome(),
        uai_formation: faker.helpers.replaceSymbols("########"),
        etablissement_formateur_uai: faker.helpers.replaceSymbols("########"),
        etablissement_gestionnaire_uai: faker.helpers.replaceSymbols("########"),
        _meta: { date_import: new Date(), created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}

export function insertUser(custom = {}) {
  custom.password = hashPassword(custom.password || "Password1234!");
  return users().insertOne(
    merge(
      {},
      {
        username: "test",
        password: custom.password,
        widget: {
          hash: "test",
          version: [],
        },
        _meta: { created_on: new Date(), updated_on: new Date() },
      },
      custom
    )
  );
}
