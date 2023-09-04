import express from "express";
import Joi from "joi";
import { mapValues } from "lodash-es";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";

import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { checkApiKey } from "#src/http/middlewares/authMiddleware.js";
import {
  addCsvHeaders,
  addJsonHeaders,
  sendFilieresStats,
  sendStats,
  sendImageOnError,
} from "#src/http/utils/responseUtils.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import { getLastMillesimesFormations, transformDisplayStat } from "#src/common/stats.js";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import RegionalesRepository from "#src/common/repositories/regionales.js";
import { ErrorRegionaleNotFound, ErrorNoDataForMillesime } from "#src/http/errors.js";

export default () => {
  const router = express.Router();

  async function sendRegionalesStats({ find, pagination }, res, options = {}) {
    let extensionTransformer;
    if (options.ext === "csv") {
      addCsvHeaders(res);
      extensionTransformer = transformIntoCSV({
        columns: {
          region: (f) => f.region.nom,
          code_certification: (f) => f.code_certification,
          filiere: (f) => f.filiere,
          millesime: (f) => f.millesime,
          ...getStatsAsColumns(),
        },
        mapper: (v) => (v === null ? "null" : v),
      });
    } else {
      addJsonHeaders(res);
      extensionTransformer = transformIntoJSON({
        arrayPropertyName: "regionales",
        arrayWrapper: {
          pagination,
        },
      });
    }

    return compose(find, transformDisplayStat(true), extensionTransformer, res);
  }

  router.get(
    "/api/inserjeunes/regionales.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, regions, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.regions(),
          ...validators.statsList(),
        }
      );

      const paginable = await RegionalesRepository.findAndPaginate(
        { region: regions, millesime: millesimes, code_certification: code_certifications },
        {
          limit: items_par_page,
          page,
        }
      );

      return sendRegionalesStats(paginable, res, rest);
    })
  );

  router.get(
    "/api/inserjeunes/regionales/:region.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { region, millesimes, code_certifications, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.region(),
          ...validators.statsList(),
        }
      );

      const paginable = await RegionalesRepository.findAndPaginate(
        { region: region, millesime: millesimes, code_certification: code_certifications },
        {
          limit: items_par_page,
          page,
        }
      );

      return sendRegionalesStats(paginable, res, rest);
    })
  );

  router.get(
    "/api/inserjeunes/regionales/:region/certifications/:codes_certifications.:ext?",
    tryCatch(async (req, res) => {
      const { region, codes_certifications, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.region(),
          codes_certifications: validators.arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(getLastMillesimesFormations()),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "filieres" || codes_certifications.length > 1) {
        const cfds = await BCNRepository.findCodesFormationDiplome(codes_certifications);
        const filieresStats =
          cfds && cfds.length > 0
            ? mapValues(
                await RegionalesRepository.getFilieresStats({
                  code_formation_diplome: cfds,
                  millesime,
                  region,
                }),
                transformDisplayStat()
              )
            : {};

        return sendImageOnError(
          async () => await sendFilieresStats(filieresStats, res, options),
          res,
          { type: "regionales", regionCode: region },
          options
        );
      }

      return sendImageOnError(
        async () => {
          const code_certification = codes_certifications[0];
          const exist = await RegionalesRepository.exist({ region, code_certification });
          if (!exist) {
            throw new ErrorRegionaleNotFound();
          }

          const result = await RegionalesRepository.first({ region, code_certification, millesime });
          if (!result) {
            const millesimesAvailable = await RegionalesRepository.findMillesime({ region, code_certification });
            throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
          }

          const stats = transformDisplayStat()(result);
          return sendStats("certification", stats, res, options);
        },
        res,
        { type: "regionales", regionCode: region },
        options
      );
    })
  );

  return router;
};
