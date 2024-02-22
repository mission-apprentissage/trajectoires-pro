import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import Joi from "joi";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { addCsvHeaders, addJsonHeaders, sendStats, sendImageOnError } from "#src/http/utils/responseUtils.js";
import { formatMillesime } from "#src/http/utils/formatters.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import { getLastMillesimesFormations, transformDisplayStat, buildDescription } from "#src/common/stats.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";
import { ErrorFormationNotFound, ErrorNoDataForMillesime } from "#src/http/errors.js";
import { getUserWidget, getIframe } from "#src/services/widget/widgetUser.js";

async function formationStats({ uai, code_certification, millesime }) {
  const exist = await FormationStatsRepository.exist({ uai, code_certification });
  if (!exist) {
    throw new ErrorFormationNotFound();
  }

  const result = await FormationStatsRepository.first({
    uai,
    code_certification,
    millesime: formatMillesime(millesime),
  });

  if (!result) {
    const millesimesAvailable = await FormationStatsRepository.findMillesime({ uai, code_certification });
    throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
  }

  const stats = transformDisplayStat()(result);
  return stats;
}

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/formations.:ext?",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { uais, regions, academies, millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.uais(),
          ...validators.regions(),
          ...validators.academies(),
          ...validators.statsList([getLastMillesimesFormations()]),
        }
      );

      let { find, pagination } = await FormationStatsRepository.findAndPaginate(
        {
          uai: uais,
          region: regions,
          "academie.code": academies,
          millesime: millesimes,
          code_certification: code_certifications,
        },
        {
          limit: items_par_page,
          page,
        }
      );

      let extensionTransformer;
      if (ext === "csv") {
        addCsvHeaders(res);
        extensionTransformer = transformIntoCSV({
          columns: {
            uai: (f) => f.uai,
            uai_type: (f) => f.uai_type,
            uai_donnee: (f) => f.uai_donnee,
            uai_donnee_type: (f) => f.uai_donnee_type,
            code_certification: (f) => f.code_certification,
            filiere: (f) => f.filiere,
            millesime: (f) => f.millesime,
            donnee_source_type: (f) => f.donnee_source.type,
            donnee_source_code_certification: (f) => f.donnee_source.code_certification,
            ...getStatsAsColumns(),
          },
          mapper: (v) => (v === null ? "null" : v),
        });
      } else {
        addJsonHeaders(res);
        extensionTransformer = transformIntoJSON({
          arrayPropertyName: "formations",
          arrayWrapper: {
            pagination,
          },
        });
      }

      compose(find, transformDisplayStat(true), extensionTransformer, res);
    })
  );

  router.get(
    "/api/inserjeunes/formations/:uai-:code_certification.:ext?",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { uai, code_certification, millesime, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.uai(),
          code_certification: Joi.string().required(),
          millesime: Joi.string().default(getLastMillesimesFormations()),
          ...validators.svg(),
        }
      );

      return sendImageOnError(
        async () => {
          const stats = await formationStats({ uai, code_certification, millesime });
          return sendStats("formation", stats, res, options);
        },
        res,
        { type: "formations" },
        options
      );
    })
  );

  router.get(
    "/api/inserjeunes/formations/:uai-:code_certification/widget/:hash",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { hash, theme, uai, code_certification, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          hash: Joi.string(),
          ...validators.uai(),
          code_certification: Joi.string().required(),
          millesime: Joi.string().default(getLastMillesimesFormations()),
          ...validators.widget("stats"),
        }
      );

      try {
        const stats = await formationStats({ uai, code_certification, millesime });
        const description = buildDescription(stats);
        const etablissement = await AcceEtablissementRepository.first({ numero_uai: uai });

        const widget = await getUserWidget({
          hash,
          type: "stats",
          theme,
          data: {
            taux: [
              { name: "formation", value: stats.taux_en_formation },
              { name: "emploi", value: stats.taux_en_emploi_6_mois },
              { name: "autres", value: stats.taux_autres_6_mois },
            ],
            millesimes: formatMillesime(millesime).split("_"),
            description,
            // TODO: fix libelle BCN
            formationLibelle: stats.libelle,
            etablissementLibelle: etablissement.appellation_officielle,
          },
          plausibleCustomProperties: {
            type: "formation",
            uai,
            code_certification,
            millesime,
          },
        });

        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      } catch (err) {
        console.log(err);
        // TODO: gestion des erreurs
        const widget = await getUserWidget({ hash, type: "error", theme, data: {} });
        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      }
    })
  );

  router.get(
    "/api/inserjeunes/formations/:uai-:code_certification/widget",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { theme, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.uai(),
          code_certification: Joi.string().required(),
          millesime: Joi.string().default(null),
          ...validators.widget("stats"),
        }
      );

      const widget = await getIframe({
        user: req.user,
        parameters: { theme, millesime },
        path: req.path,
      });

      res.setHeader("content-type", "text/html");
      return res.status(200).send(widget);
    })
  );
  return router;
};
