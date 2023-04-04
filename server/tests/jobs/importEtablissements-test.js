import { assert } from "chai";
import fs from "fs";
import MockDate from "mockdate";
import { createNock } from "../utils/apiMocks.js";
import * as CA from "../../src/common/catalogueApprentissage/etablissements.js";
import { caEtablissements, acceEtablissements } from "../../src/common/db/collections/collections.js";
import {
  importEtablissements,
  importCAEtablissements,
  importACCEEtablissements,
} from "../../src/jobs/importEtablissements.js";

describe("importEtablissements", () => {
  const date = "2022-12-18T10:10:00.451Z";

  beforeEach(() => {
    MockDate.set(date);
  });
  afterEach(() => {
    MockDate.reset();
  });

  describe("importCAEtablissements", () => {
    it("Vérifie qu'on peut importer les établissements", async () => {
      let client = createNock(CA.baseUrl);
      client
        .get("/etablissements.json")
        .query({ limit: 0 })
        .reply(200, await fs.promises.readFile(`tests/fixtures/files/catalogueApprentissage/etablissements.json`));

      let stats = await importCAEtablissements();
      assert.deepStrictEqual(stats, { created: 2, updated: 0, failed: 0 });

      const count = await caEtablissements().countDocuments();
      assert.strictEqual(count, 2);

      const foundFirst = await caEtablissements().findOne({ uai: "0881529J" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundFirst, {
        adresse: "LYCEE POLYVALENT ANDRE MALRAUX GRETA LORRAINE SUD 13 RUE DE L EPINETTE 88200 REMIREMONT FRANCE",
        code_insee_localite: "88383",
        code_postal: "88200",
        commune_implantation_code: "88383",
        commune_implantation_nom: "REMIREMONT",
        date_creation: new Date("2017-10-22T22:00:00.000Z"),
        date_fermeture: new Date("1970-01-01T00:00:00.000Z"),
        geo_coordonnees: "48.021191,6.587702",
        localite: "REMIREMONT",
        naf_code: "85.59A",
        naf_libelle: "Formation continue d'adultes",
        nda: "44880137688",
        nom_academie: "Nancy-Metz",
        nom_departement: "Vosges",
        nom_voie: "DE L EPINETTE",
        num_academie: 12,
        num_departement: "88",
        numero_voie: "13",
        pays_implantation_code: "FR",
        pays_implantation_nom: "FRANCE",
        rco_code_insee_localite: "88383",
        rco_code_postal: "88200",
        rco_uai: "0881529J",
        region_implantation_code: "44",
        region_implantation_nom: "Grand Est",
        siren: "198801532",
        siret: "19880153200047",
        type_voie: "RUE",
        uai: "0881529J",
        uai_valide: true,
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
      });

      const foundSecond = await caEtablissements().findOne({ uai: "0251893X" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundSecond, {
        adresse: "CENTRE FORMATION BOURGOGNE FRANCHE COMTE 15 IMPASSE DES SAINTS MARTIN 25000 BESANCON FRANCE",
        code_insee_localite: "25056",
        code_postal: "25000",
        commune_implantation_code: "25056",
        commune_implantation_nom: "BESANCON",
        date_creation: new Date("1995-06-30T22:00:00.000Z"),
        date_fermeture: new Date("1970-01-01T00:00:00.000Z"),
        geo_coordonnees: "47.216461,5.956441",
        localite: "BESANCON",
        naf_code: "85.59A",
        naf_libelle: "Formation continue d'adultes",
        nda: "43250000425",
        nom_academie: "Besançon",
        nom_departement: "Doubs",
        nom_voie: "DES SAINTS MARTIN",
        num_academie: 3,
        num_departement: "25",
        numero_voie: "15",
        onisep_code_postal: "25000",
        onisep_nom: "Centre de formation Bourgogne-Franche-Comté - antenne du CFA des MFR",
        onisep_url: "www.onisep.fr/http/redirection/etablissement/slug/ENS.5205",
        pays_implantation_code: "FR",
        pays_implantation_nom: "FRANCE",
        rco_code_insee_localite: "25056",
        rco_code_postal: "25000",
        rco_uai: "0251893X",
        region_implantation_code: "27",
        region_implantation_nom: "Bourgogne-Franche-Comté",
        siren: "306772716",
        siret: "30677271600024",
        type_voie: "IMPASSE",
        uai: "0251893X",
        uai_valide: true,
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
      });
    });
  });

  describe("importACCEtablissements", () => {
    it("Vérifie qu'on peut importer les établissements", async () => {
      let stats = await importACCEEtablissements({ file: `tests/fixtures/files/acce/etablissements.csv` });
      assert.deepStrictEqual(stats, { created: 2, updated: 0, failed: 0 });

      const count = await acceEtablissements().countDocuments();
      assert.strictEqual(count, 2);

      const foundFirst = await acceEtablissements().findOne({ numero_uai: "0010001W" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundFirst, {
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
        academie: "10",
        academie_libe: "Lyon",
        adresse_uai: "223 rue ALEXANDRE BERARD",
        appariement: "Parfaite",
        appellation_officielle: "Lycée professionnel Alexandre Bérard - Lycée des métiers de l'énergie et de l'habitat",
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
        date_derniere_mise_a_jour: new Date("1965-04-30T23:00:00.000Z"),
        date_geolocalisation: new Date("1965-04-30T23:00:00.000Z"),
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
        numero_uai: "0010001W",
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
      });

      const foundSecond = await acceEtablissements().findOne({ numero_uai: "0010002X" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundSecond, {
        academie: "10",
        academie_libe: "Lyon",
        adresse_uai: "6 rue AGUETANT",
        appariement: "Parfaite",
        appellation_officielle: "Collège Saint-Exupéry",
        boite_postale_uai: "BP508",
        categorie_financiere: "4",
        categorie_financiere_libe: "4",
        categorie_juridique: "200",
        categorie_juridique_libe: "Etablissement public local d'enseignement (EPLE)",
        code_postal_uai: "01500",
        commune: "01004",
        commune_libe: "Ambérieu-en-Bugey",
        contrat_etablissement: "99",
        contrat_etablissement_libe: "Sans objet",
        coordonnee_x: "882408.2",
        coordonnee_y: "6543019.6",
        date_derniere_mise_a_jour: new Date("1965-04-30T23:00:00.000Z"),
        date_geolocalisation: new Date("1965-04-30T23:00:00.000Z"),
        date_ouverture: new Date("1965-04-30T23:00:00.000Z"),
        denomination_principale: "COLLEGE",
        departement_insee_3: "001",
        departement_insee_3_libe: "Ain",
        etat_etablissement: "1",
        etat_etablissement_libe: "Ouvert",
        etat_sirad_uai: "1",
        hebergement_etablissement: "12",
        hebergement_etablissement_libe: "Sans internat avec demi-pension",
        localisation: "Numéro de rue",
        localite_acheminement_uai: "AMBERIEU EN BUGEY",
        mel_uai: "ce.0010002X@ac-lyon.fr",
        ministere_tutelle: "06",
        ministere_tutelle_libe: "ministère de l'éducation nationale",
        nature_uai: "340",
        nature_uai_libe: "Collège",
        niveau_uai: "1",
        niveau_uai_libe: "UAI célibataire",
        numero_siren_siret_uai: "19010002400016",
        numero_telecopieur_uai: "04 74 38 08 65",
        numero_telephone_uai: "04 74 38 40 77",
        numero_uai: "0010002X",
        patronyme_uai: "SAINT-EXUPERY",
        pays: "100",
        pays_libe: "France",
        secteur_public_prive: "PU",
        secteur_public_prive_libe: "Public",
        sigle_uai: "CLG",
        site_web: "http://www2.ac-lyon.fr/etab/colleges/col-01/st-exupery/",
        situation_comptable: "3",
        situation_comptable_libe: "Rattaché à une agence comptable",
        source: "IGN",
        type_uai: "CLG",
        type_uai_libe: "Collèges",
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
      });
    });
  });

  describe("importEtablissements", () => {
    it("Vérifie qu'on peut importer les établissements", async () => {
      let client = createNock(CA.baseUrl);
      client
        .get("/etablissements.json")
        .query({ limit: 0 })
        .reply(200, await fs.promises.readFile(`tests/fixtures/files/catalogueApprentissage/etablissements.json`));

      let stats = await importEtablissements({ file: `tests/fixtures/files/acce/etablissements.csv` });
      assert.deepStrictEqual(stats, {
        jobStatsACCE: { created: 2, updated: 0, failed: 0 },
        jobStatsCA: { created: 2, updated: 0, failed: 0 },
      });

      const count = await acceEtablissements().countDocuments();
      assert.strictEqual(count, 2);

      const foundFirst = await acceEtablissements().findOne({ numero_uai: "0010001W" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundFirst, {
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
        academie: "10",
        academie_libe: "Lyon",
        adresse_uai: "223 rue ALEXANDRE BERARD",
        appariement: "Parfaite",
        appellation_officielle: "Lycée professionnel Alexandre Bérard - Lycée des métiers de l'énergie et de l'habitat",
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
        date_derniere_mise_a_jour: new Date("1965-04-30T23:00:00.000Z"),
        date_geolocalisation: new Date("1965-04-30T23:00:00.000Z"),
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
        numero_uai: "0010001W",
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
      });

      const foundSecond = await acceEtablissements().findOne({ numero_uai: "0010002X" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundSecond, {
        academie: "10",
        academie_libe: "Lyon",
        adresse_uai: "6 rue AGUETANT",
        appariement: "Parfaite",
        appellation_officielle: "Collège Saint-Exupéry",
        boite_postale_uai: "BP508",
        categorie_financiere: "4",
        categorie_financiere_libe: "4",
        categorie_juridique: "200",
        categorie_juridique_libe: "Etablissement public local d'enseignement (EPLE)",
        code_postal_uai: "01500",
        commune: "01004",
        commune_libe: "Ambérieu-en-Bugey",
        contrat_etablissement: "99",
        contrat_etablissement_libe: "Sans objet",
        coordonnee_x: "882408.2",
        coordonnee_y: "6543019.6",
        date_derniere_mise_a_jour: new Date("1965-04-30T23:00:00.000Z"),
        date_geolocalisation: new Date("1965-04-30T23:00:00.000Z"),
        date_ouverture: new Date("1965-04-30T23:00:00.000Z"),
        denomination_principale: "COLLEGE",
        departement_insee_3: "001",
        departement_insee_3_libe: "Ain",
        etat_etablissement: "1",
        etat_etablissement_libe: "Ouvert",
        etat_sirad_uai: "1",
        hebergement_etablissement: "12",
        hebergement_etablissement_libe: "Sans internat avec demi-pension",
        localisation: "Numéro de rue",
        localite_acheminement_uai: "AMBERIEU EN BUGEY",
        mel_uai: "ce.0010002X@ac-lyon.fr",
        ministere_tutelle: "06",
        ministere_tutelle_libe: "ministère de l'éducation nationale",
        nature_uai: "340",
        nature_uai_libe: "Collège",
        niveau_uai: "1",
        niveau_uai_libe: "UAI célibataire",
        numero_siren_siret_uai: "19010002400016",
        numero_telecopieur_uai: "04 74 38 08 65",
        numero_telephone_uai: "04 74 38 40 77",
        numero_uai: "0010002X",
        patronyme_uai: "SAINT-EXUPERY",
        pays: "100",
        pays_libe: "France",
        secteur_public_prive: "PU",
        secteur_public_prive_libe: "Public",
        sigle_uai: "CLG",
        site_web: "http://www2.ac-lyon.fr/etab/colleges/col-01/st-exupery/",
        situation_comptable: "3",
        situation_comptable_libe: "Rattaché à une agence comptable",
        source: "IGN",
        type_uai: "CLG",
        type_uai_libe: "Collèges",
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
      });

      const countCA = await caEtablissements().countDocuments();
      assert.strictEqual(countCA, 2);

      const foundCAFirst = await caEtablissements().findOne({ uai: "0881529J" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundCAFirst, {
        adresse: "LYCEE POLYVALENT ANDRE MALRAUX GRETA LORRAINE SUD 13 RUE DE L EPINETTE 88200 REMIREMONT FRANCE",
        code_insee_localite: "88383",
        code_postal: "88200",
        commune_implantation_code: "88383",
        commune_implantation_nom: "REMIREMONT",
        date_creation: new Date("2017-10-22T22:00:00.000Z"),
        date_fermeture: new Date("1970-01-01T00:00:00.000Z"),
        geo_coordonnees: "48.021191,6.587702",
        localite: "REMIREMONT",
        naf_code: "85.59A",
        naf_libelle: "Formation continue d'adultes",
        nda: "44880137688",
        nom_academie: "Nancy-Metz",
        nom_departement: "Vosges",
        nom_voie: "DE L EPINETTE",
        num_academie: 12,
        num_departement: "88",
        numero_voie: "13",
        pays_implantation_code: "FR",
        pays_implantation_nom: "FRANCE",
        rco_code_insee_localite: "88383",
        rco_code_postal: "88200",
        rco_uai: "0881529J",
        region_implantation_code: "44",
        region_implantation_nom: "Grand Est",
        siren: "198801532",
        siret: "19880153200047",
        type_voie: "RUE",
        uai: "0881529J",
        uai_valide: true,
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
      });

      const foundCASecond = await caEtablissements().findOne({ uai: "0251893X" }, { projection: { _id: 0 } });
      assert.deepStrictEqual(foundCASecond, {
        adresse: "CENTRE FORMATION BOURGOGNE FRANCHE COMTE 15 IMPASSE DES SAINTS MARTIN 25000 BESANCON FRANCE",
        code_insee_localite: "25056",
        code_postal: "25000",
        commune_implantation_code: "25056",
        commune_implantation_nom: "BESANCON",
        date_creation: new Date("1995-06-30T22:00:00.000Z"),
        date_fermeture: new Date("1970-01-01T00:00:00.000Z"),
        geo_coordonnees: "47.216461,5.956441",
        localite: "BESANCON",
        naf_code: "85.59A",
        naf_libelle: "Formation continue d'adultes",
        nda: "43250000425",
        nom_academie: "Besançon",
        nom_departement: "Doubs",
        nom_voie: "DES SAINTS MARTIN",
        num_academie: 3,
        num_departement: "25",
        numero_voie: "15",
        onisep_code_postal: "25000",
        onisep_nom: "Centre de formation Bourgogne-Franche-Comté - antenne du CFA des MFR",
        onisep_url: "www.onisep.fr/http/redirection/etablissement/slug/ENS.5205",
        pays_implantation_code: "FR",
        pays_implantation_nom: "FRANCE",
        rco_code_insee_localite: "25056",
        rco_code_postal: "25000",
        rco_uai: "0251893X",
        region_implantation_code: "27",
        region_implantation_nom: "Bourgogne-Franche-Comté",
        siren: "306772716",
        siret: "30677271600024",
        type_voie: "IMPASSE",
        uai: "0251893X",
        uai_valide: true,
        _meta: {
          created_on: new Date(date),
          date_import: new Date(date),
          updated_on: new Date(date),
        },
      });
    });
  });
});
