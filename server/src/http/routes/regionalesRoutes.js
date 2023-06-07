import express from "express";
import Joi from "joi";
import { mapValues } from "lodash-es";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";

import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import * as validators from "../utils/validators.js";
import { validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import {
  addCsvHeaders,
  addJsonHeaders,
  sendFilieresStats,
  sendStats,
  sendImageOnError,
} from "../utils/responseUtils.js";
import { findCodeFormationDiplome } from "../../common/bcn.js";
import { getLastMillesimesFormations, transformDisplayStat } from "../../common/stats.js";
import { getStatsAsColumns } from "../../common/utils/csvUtils.js";
import RegionalesRepository from "../../common/repositories/regionales.js";
import { ErrorRegionaleNotFound, ErrorNoDataForMillesime } from "../errors.js";

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
    "/api/inserjeunes/regionales/:region/certifications/:code_certification.:ext?",
    tryCatch(async (req, res) => {
      const { region, code_certification, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.region(),
          code_certification: Joi.string().required(),
          millesime: Joi.string().default(getLastMillesimesFormations()),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "filieres") {
        const cfd = await findCodeFormationDiplome(code_certification);
        const filieresStats = cfd
          ? mapValues(
              await RegionalesRepository.getFilieresStats({
                code_formation_diplome: cfd,
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
          const exist = await RegionalesRepository.exist({ region, code_certification });
          if (!exist) {
            throw new ErrorRegionaleNotFound();
          }

          const result = await RegionalesRepository.find({ region, code_certification, millesime });
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
