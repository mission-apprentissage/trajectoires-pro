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
import { getLastMillesimes, transformDisplayStat } from "#src/common/stats.js";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import CertificationsRepository from "#src/common/repositories/certificationStats.js";
import { ErrorNoDataForMillesime, ErrorCertificationNotFound } from "#src/http/errors.js";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/certifications.:ext?",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.statsList(),
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
          return sendStats("certification", stats, res, options);
        },
        res,
        { type: "certifications" },
        options
      );
    })
  );

  return router;
};
