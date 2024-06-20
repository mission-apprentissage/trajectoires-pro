import express from "express";
import { mapValues, isEmpty } from "lodash-es";
import Joi from "joi";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { formatCodesCertifications, formatMillesime } from "#src/http/utils/formatters.js";
import {
  addCsvHeaders,
  addJsonHeaders,
  sendFilieresStats,
  sendStats,
  sendImageOnError,
} from "#src/http/utils/responseUtils.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import { getLastMillesimes, transformDisplayStat } from "#src/common/stats.js";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import CertificationsRepository from "#src/common/repositories/certificationStats.js";
import { ErrorNoDataForMillesime, ErrorCertificationNotFound, ErrorCertificationsNotFound } from "#src/http/errors.js";
import { getUserWidget, getIframe } from "#src/services/widget/widgetUser.js";
import { formatDataFilieresWidget, formatDataWidget } from "#src/http/utils/widgetUtils.js";

async function certificationStats({ codes_certifications, millesime }) {
  const code_certification = codes_certifications[0];

  const result = await CertificationsRepository.first({ code_certification, millesime });

  if (!result) {
    const exist = await CertificationsRepository.exist({ code_certification });
    if (!exist) {
      throw new ErrorCertificationNotFound();
    }

    const millesimesAvailable = await CertificationsRepository.findMillesime({ code_certification });
    throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
  }

  const stats = transformDisplayStat()(result);
  return stats;
}

async function certificationsFilieresStats({ codes_certifications, millesime }) {
  const cfds = await BCNRepository.findCodesFormationDiplome(codes_certifications);
  if (!cfds || cfds.length === 0) {
    throw new ErrorCertificationsNotFound();
  }

  const filieresStats = mapValues(
    await CertificationsRepository.getFilieresStats({
      code_formation_diplome: cfds,
      millesime,
    }),
    transformDisplayStat()
  );

  if (isEmpty(filieresStats)) {
    throw new ErrorCertificationsNotFound();
  }

  return filieresStats;
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
        },
        { code_certifications: formatCodesCertifications }
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
          ...validators.codesCertifications(),
          ...validators.universe(),
          millesime: Joi.string().default(getLastMillesimes()),
          ...validators.vues(),
          ...validators.svg(),
        },
        { codes_certifications: formatCodesCertifications }
      );

      if (vue === "filieres" || codes_certifications.length > 1) {
        return sendImageOnError(
          async () => {
            const filieresStats = await certificationsFilieresStats({ codes_certifications, millesime });
            await sendFilieresStats(filieresStats, res, options);
          },
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
      const { hash, theme, codes_certifications, millesime, vue } = await validate(
        { ...req.params, ...req.query },
        {
          hash: Joi.string(),
          ...validators.codesCertifications(),
          ...validators.universe(),
          millesime: Joi.string().default(getLastMillesimes()),
          ...validators.vues(),
          ...validators.widget("stats"),
        },
        { codes_certifications: formatCodesCertifications }
      );

      try {
        if (vue === "filieres" || codes_certifications.length > 1) {
          const filieresStats = await certificationsFilieresStats({ codes_certifications, millesime });
          const data = await formatDataFilieresWidget({ filieresStats, millesime });
          const widget = await getUserWidget({
            hash,
            name: "stats",
            theme,
            data,
            plausibleCustomProperties: {
              type: "certifications",
              code_certification: codes_certifications.join(";"),
              millesime,
            },
          });

          res.setHeader("content-type", "text/html");
          return res.status(200).send(widget);
        }

        const stats = await certificationStats({ codes_certifications, millesime });
        const data = await formatDataWidget({ stats, millesime });
        const widget = await getUserWidget({
          hash,
          name: "stats",
          theme,
          data,
          plausibleCustomProperties: {
            type: "certification",
            code_certification: codes_certifications[0],
            millesime,
          },
        });

        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      } catch (err) {
        const widget = await getUserWidget({
          hash,
          name: "error",
          theme,
          data: {
            error: err.name,
            millesimes: formatMillesime(millesime).split("_"),
            code_certification: codes_certifications[0],
          },
        });
        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      }
    })
  );

  router.get(
    "/api/inserjeunes/certifications/:codes_certifications/widget",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { theme, millesime, vue } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.codesCertifications(),
          ...validators.universe(),
          millesime: Joi.string().default(null),
          ...validators.vues(),
          ...validators.widget("stats"),
        },
        { codes_certifications: formatCodesCertifications }
      );

      const widget = getIframe({
        user: req.user,
        parameters: { theme, millesime, vue },
        path: req.path,
      });

      res.setHeader("content-type", "text/html");
      return res.status(200).send(widget);
    })
  );

  return router;
};
