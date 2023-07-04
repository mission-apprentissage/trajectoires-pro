import chai, { assert } from "chai";
import chaiAsPromised from "chai-as-promised";
import fs from "fs";
import sinon, { stub } from "sinon";
import Boom from "boom";
import { sendFilieresStats } from "../../../src/http/utils/responseUtils.js";

chai.use(chaiAsPromised);

describe("responseUtils", () => {
  describe("sendFilieresStats", () => {
    describe("json", () => {
      it("Retourne une erreur quand il n'y a pas de données disponible pour la stats", async () => {
        const res = {};
        await assert.isRejected(sendFilieresStats({}, res), Boom, "Certifications inconnues");
      });

      it("Retourne un json avec les stats", async () => {
        const res = { json: stub() };
        await sendFilieresStats({ taux: 1 }, res);
        sinon.assert.calledWith(res.json, { taux: 1 });
      });
    });

    describe("svg", () => {
      it("Retourne une erreur quand il n'y a pas de données disponible pour construire le widget", async () => {
        const res = {};
        await assert.isRejected(
          sendFilieresStats(
            {
              pro: {},
              apprentissage: {},
            },
            res,
            { ext: "svg" }
          ),
          Boom,
          "Données non disponibles"
        );
      });

      it("Retourne un SVG avec les données pour la voie pro et apprentissage", async () => {
        const stats = {
          apprentissage: {
            codes_certifications: ["12345678"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            filiere: "apprentissage",
            millesime: "2020",
            nb_sortant: 100,
            nb_annee_term: 50,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
            //computed
            taux_en_formation: 10,
            taux_en_emploi_6_mois: 100,
            taux_autres_6_mois: 0,
          },
          pro: {
            codes_certifications: ["23830024202"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            filiere: "pro",
            millesime: "2020",
            nb_sortant: 100,
            nb_annee_term: 50,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
            //computed
            taux_en_formation: 10,
            taux_en_emploi_6_mois: 100,
            taux_autres_6_mois: 0,
          },
        };

        const res = { status: stub(), setHeader: stub(), send: stub() };
        res.status.returns(res);

        await sendFilieresStats(stats, res, { ext: "svg" });

        const fixture = await fs.promises.readFile(
          `tests/fixtures/widgets/dsfr/certifications/12345678_23830024202.svg`,
          "utf8"
        );

        sinon.assert.calledWith(res.send, fixture);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.setHeader, "content-type", "image/svg+xml");
      });

      it("Retourne un SVG avec les données pour la voie pro quand la voie apprentissage n'a pas de données", async () => {
        const stats = {
          apprentissage: null,
          pro: {
            codes_certifications: ["23830024202"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            filiere: "pro",
            millesime: "2020",
            nb_sortant: 100,
            nb_annee_term: 50,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
            //computed
            taux_en_formation: 10,
            taux_en_emploi_6_mois: 100,
            taux_autres_6_mois: 0,
          },
        };

        const res = { status: stub(), setHeader: stub(), send: stub() };
        res.status.returns(res);

        await sendFilieresStats(stats, res, { ext: "svg" });

        const fixture = await fs.promises.readFile(
          `tests/fixtures/widgets/dsfr/certifications/12345678_23830024202_pro.svg`,
          "utf8"
        );

        sinon.assert.calledWith(res.send, fixture);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.setHeader, "content-type", "image/svg+xml");
      });

      it("Retourne un SVG avec les données pour la voie apprentissage quand la voie pro n'a pas de données", async () => {
        const stats = {
          pro: null,
          apprentissage: {
            codes_certifications: ["23830024202"],
            code_formation_diplome: "12345678",
            codes_formation_diplome: ["12345678"],
            diplome: {
              code: "4",
              libelle: "BAC",
            },
            filiere: "apprentissage",
            millesime: "2020",
            nb_sortant: 100,
            nb_annee_term: 50,
            nb_poursuite_etudes: 5,
            nb_en_emploi_24_mois: 25,
            nb_en_emploi_18_mois: 25,
            nb_en_emploi_12_mois: 25,
            nb_en_emploi_6_mois: 50,
            //computed
            taux_en_formation: 10,
            taux_en_emploi_6_mois: 100,
            taux_autres_6_mois: 0,
          },
        };

        const res = { status: stub(), setHeader: stub(), send: stub() };
        res.status.returns(res);

        await sendFilieresStats(stats, res, { ext: "svg" });

        const fixture = await fs.promises.readFile(
          `tests/fixtures/widgets/dsfr/certifications/12345678_23830024202_apprentissage.svg`,
          "utf8"
        );

        sinon.assert.calledWith(res.send, fixture);
        sinon.assert.calledWith(res.status, 200);
        sinon.assert.calledWith(res.setHeader, "content-type", "image/svg+xml");
      });
    });
  });
});
