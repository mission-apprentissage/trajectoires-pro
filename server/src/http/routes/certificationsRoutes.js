import express from "express";
import { mapValues } from "lodash-es";
import Joi from "joi";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import * as validators from "#src/http/utils/validators.js";
import { arrayOf, validate } from "#src/http/utils/validators.js";
import { formatMillesime } from "#src/http/utils/formatters.js";
import {
  addCsvHeaders,
  addJsonHeaders,
  sendFilieresStats,
  sendStats,
  sendImageOnError,
} from "#src/http/utils/responseUtils.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import { getLastMillesimes, transformDisplayStat, buildDescription } from "#src/common/stats.js";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import CertificationsRepository from "#src/common/repositories/certificationStats.js";
import { ErrorNoDataForMillesime, ErrorCertificationNotFound } from "#src/http/errors.js";
import { getUserWidget, getIframe } from "#src/services/widget/widgetUser.js";

async function certificationStats({ codes_certifications, millesime }) {
  const code_certification = codes_certifications[0];
  const exist = await CertificationsRepository.exist({ code_certification });
  if (!exist) {
    throw new ErrorCertificationNotFound();
  }

  const result = await CertificationsRepository.first({ code_certification, millesime });
  if (!result) {
    const millesimesAvailable = await CertificationsRepository.findMillesime({ code_certification });
    throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
  }

  const stats = transformDisplayStat()(result);
  return stats;
}

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/certifications.:ext?",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.statsList([getLastMillesimes()]),
        }
      );

      let { find, pagination } = await CertificationsRepository.findAndPaginate(
        { millesime: millesimes.map(formatMillesime), code_certification: code_certifications },
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
          arrayPropertyName: "certifications",
          arrayWrapper: {
            pagination,
          },
        });
      }

      return compose(find, transformDisplayStat(true), extensionTransformer, res);
    })
  );

  router.get(
    "/api/inserjeunes/certifications/:codes_certifications.:ext?",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { codes_certifications, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          codes_certifications: arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(getLastMillesimes()),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "filieres" || codes_certifications.length > 1) {
        const cfds = await BCNRepository.findCodesFormationDiplome(codes_certifications);
        const filieresStats =
          cfds && cfds.length > 0
            ? mapValues(
                await CertificationsRepository.getFilieresStats({
                  code_formation_diplome: cfds,
                  millesime,
                }),
                transformDisplayStat()
              )
            : {};

        return sendImageOnError(
          async () => await sendFilieresStats(filieresStats, res, options),
          res,
          { type: "certifications" },
          options
        );
      }

      return sendImageOnError(
        async () => {
          const stats = await certificationStats({ codes_certifications, millesime });
          return sendStats("certification", stats, res, options);
        },
        res,
        { type: "certifications" },
        options
      );
    })
  );

  router.get(
    "/api/inserjeunes/certifications/:codes_certifications/widget/:hash",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { hash, theme, codes_certifications, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          hash: Joi.string(),
          codes_certifications: arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(getLastMillesimes()),
          ...validators.vues(),
          ...validators.widget("stats"),
        }
      );

      try {
        const stats = await certificationStats({ codes_certifications, millesime });
        const description = buildDescription(stats);

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
          },
          plausibleCustomProperties: {
            type: "certification",
            code_certification: codes_certifications[0],
            millesime,
          },
        });

        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      } catch (err) {
        const widget = await getUserWidget({ hash, type: "error", theme });
        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      }
    })
  );

  router.get(
    "/api/inserjeunes/certifications/:codes_certifications/widget",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { theme, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          codes_certifications: arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(null),
          ...validators.vues(),
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
