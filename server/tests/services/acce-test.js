import assert from "assert";
import path from "path";
import streamToArray from "stream-to-array";
import config from "#src/config.js";
import { getDirname } from "#src/common/utils/esmUtils.js";
import * as ACCE from "#src/services/acce.js";

describe("acce", () => {
  it("Retourne un stream d'établissements", async () => {
    config.acce.files.etablissements = path.join(
      getDirname(import.meta.url),
      "../fixtures/files/acce/acce_etablissements.csv"
    );
    const etablissements = await streamToArray(ACCE.etablissements());
    assert.deepEqual(etablissements, [
      {
        numero_uai: "0010001W",
        nature_uai: "320",
        nature_uai_libe: "Lycée professionnel",
        type_uai: "LP",
        type_uai_libe: "Lycées professionnels",
        etat_etablissement: "1",
        etat_etablissement_libe: "Ouvert",
        ministere_tutelle: "06",
        ministere_tutelle_libe: "ministère de l'éducation nationale",
        secteur_public_prive: "PU",
        secteur_public_prive_libe: "Public",
        sigle_uai: "LP LYC METIER",
        categorie_juridique: "200",
        categorie_juridique_libe: "Etablissement public local d'enseignement (EPLE)",
        contrat_etablissement: "99",
        contrat_etablissement_libe: "Sans objet",
        categorie_financiere: "4",
        categorie_financiere_libe: "4",
        situation_comptable: "2",
        situation_comptable_libe: "Siège de l'agence comptable",
        niveau_uai: "1",
        niveau_uai_libe: "UAI célibataire",
        commune: "01004",
        commune_libe: "Ambérieu-en-Bugey",
        academie: "10",
        academie_libe: "Lyon",
        pays: "100",
        pays_libe: "France",
        departement_insee_3: "001",
        departement_insee_3_libe: "Ain",
        denomination_principale: "LP LYCEE DES METIERS",
        appellation_officielle: "Lycée professionnel Alexandre Bérard - Lycée des métiers de l'énergie et de l'habitat",
        patronyme_uai: "ALEXANDRE BERARD",
        hebergement_etablissement: "22",
        hebergement_etablissement_libe: "Avec internat et demi-pension",
        numero_siren_siret_uai: "19010001600012",
        date_ouverture: "01/05/1965",
        date_derniere_mise_a_jour: "08/05/2023",
        adresse_uai: "223 rue ALEXANDRE BERARD",
        code_postal_uai: "01500",
        etat_sirad_uai: "1",
        localite_acheminement_uai: "AMBERIEU EN BUGEY",
        numero_telephone_uai: "04 74 38 01 99",
        numero_telecopieur_uai: "04 74 38 97 16",
        mel_uai: "ce.0010001W@ac-lyon.fr",
        site_web: "https://alexandre-berard.ent.auvergnerhonealpes.fr/",
        coordonnee_x: "881947.9",
        coordonnee_y: "6544401.7",
        appariement: "Parfaite",
        localisation: "Numéro de rue",
        date_geolocalisation: "04/04/2023",
        source: "IGN",
      },
    ]);
  });
});
