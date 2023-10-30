import chai from "chai";
import path from "path";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import streamToArray from "stream-to-array";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import config from "#src/config.js";
import { getDirname } from "#src/common/utils/esmUtils.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";
import { importEtablissements } from "#src/jobs/etablissements/importEtablissements.js";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("importEtablissements", () => {
  before(() => {
    MockDate.set("2023-01-01");

    // Use the fixture by default
    config.acce.files.etablissements = path.join(
      getDirname(import.meta.url),
      "../../fixtures/files/acce/acce_etablissements.csv"
    );
  });

  after(() => {
    MockDate.reset();
  });

  it("Vérifie qu'on peut importer les établissements", async () => {
    let stats = await importEtablissements();

    const found = await streamToArray(await AcceEtablissementRepository.find({}));
    assert.deepEqualInAnyOrder(
      found.map((f) => omit(f, "_id")),
      [
        {
          numero_uai: "0010001W",
          academie: "10",
          academie_libe: "Lyon",
          adresse_uai: "223 rue ALEXANDRE BERARD",
          appariement: "Parfaite",
          appellation_officielle:
            "Lycée professionnel Alexandre Bérard - Lycée des métiers de l'énergie et de l'habitat",
          categorie_financiere: "4",
          categorie_financiere_libe: "4",
          categorie_juridique: "200",
          categorie_juridique_libe: "Etablissement public local d'enseignement (EPLE)",
          code_postal_uai: "01500",
          commune: "01004",
          commune_libe: "Ambérieu-en-Bugey",
          contrat_etablissement: "99",
          contrat_etablissement_libe: "Sans objet",
          coordonnee_x: "881947.9",
          coordonnee_y: "6544401.7",
          date_derniere_mise_a_jour: new Date("2023-05-07T22:00:00.000Z"),
          date_geolocalisation: new Date("2023-04-03T22:00:00.000Z"),
          date_ouverture: new Date("1965-04-30T23:00:00.000Z"),
          denomination_principale: "LP LYCEE DES METIERS",
          departement_insee_3: "001",
          departement_insee_3_libe: "Ain",
          etat_etablissement: "1",
          etat_etablissement_libe: "Ouvert",
          etat_sirad_uai: "1",
          hebergement_etablissement: "22",
          hebergement_etablissement_libe: "Avec internat et demi-pension",
          localisation: "Numéro de rue",
          localite_acheminement_uai: "AMBERIEU EN BUGEY",
          mel_uai: "ce.0010001W@ac-lyon.fr",
          ministere_tutelle: "06",
          ministere_tutelle_libe: "ministère de l'éducation nationale",
          nature_uai: "320",
          nature_uai_libe: "Lycée professionnel",
          niveau_uai: "1",
          niveau_uai_libe: "UAI célibataire",
          numero_siren_siret_uai: "19010001600012",
          numero_telecopieur_uai: "04 74 38 97 16",
          numero_telephone_uai: "04 74 38 01 99",
          patronyme_uai: "ALEXANDRE BERARD",
          pays: "100",
          pays_libe: "France",
          secteur_public_prive: "PU",
          secteur_public_prive_libe: "Public",
          sigle_uai: "LP LYC METIER",
          site_web: "https://alexandre-berard.ent.auvergnerhonealpes.fr/",
          situation_comptable: "2",
          situation_comptable_libe: "Siège de l'agence comptable",
          source: "IGN",
          type_uai: "LP",
          type_uai_libe: "Lycées professionnels",
          _meta: {
            created_on: new Date(),
            date_import: new Date(),
            updated_on: new Date(),
          },
        },
      ]
    );
    assert.deepStrictEqual(stats, {
      created: 1,
      failed: 0,
      updated: 0,
      total: 1,
    });
  });
});
