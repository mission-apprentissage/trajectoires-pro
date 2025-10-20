import express from "express";
import { mapValues, isEmpty } from "lodash-es";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { formatCodesCertifications } from "#src/http/utils/formatters.js";
import {
  addCsvHeaders,
  addJsonHeaders,
  sendFilieresStats,
  sendStats,
  sendImageOnError,
} from "#src/http/utils/responseUtils.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import {
  ALL_WITHOUT_INCOME,
  getLastMillesimesRegionales,
  transformDisplayStat,
  statsAnneeTerminale,
} from "#src/common/stats.js";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import { ErrorRegionaleNotFound, ErrorNoDataForMillesime, ErrorFormationNotExist } from "#src/http/errors.js";

async function regionaleStats({ codes_certifications, region, millesime, fetchAnneesTerminales = false }) {
  const code_certification = codes_certifications[0];

  const result = await RegionaleStatsRepository.first({ region, code_certification, millesime });

  if (!result) {
    const existFormation = await BCNRepository.exist({ code_certification });
    if (!existFormation) {
      throw new ErrorFormationNotExist();
    }

    const exist = await RegionaleStatsRepository.exist({ region, code_certification });
    if (!exist) {
      throw new ErrorRegionaleNotFound();
    }

    const millesimesAvailable = await RegionaleStatsRepository.findMillesime({ region, code_certification });
    throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
  }

  // Récupère les données de l'année terminale automatiquement
  if (fetchAnneesTerminales && result.certificationsTerminales) {
    return await statsAnneeTerminale(regionaleStats, result, { region, millesime });
  }

  const stats = transformDisplayStat()(result);
  return stats;
}

async function regionaleFilieresStats({ codes_certifications, millesime, region }) {
  const cfds = await BCNRepository.findCodesFormationDiplome(codes_certifications);
  if (!cfds || cfds.length === 0) {
    throw new ErrorFormationNotExist();
  }

  const filieresStats = mapValues(
    await RegionaleStatsRepository.getFilieresStats({
      code_formation_diplome: cfds,
      millesime,
      region,
    }),
    transformDisplayStat()
  );

  if (isEmpty(filieresStats)) {
    throw new ErrorRegionaleNotFound();
  }

  return filieresStats;
}

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
          code_formation_diplome: (f) => f.code_formation_diplome,
          filiere: (f) => f.filiere,
          millesime: (f) => f.millesime,
          donnee_source_type: (f) => f.donnee_source.type,
          donnee_source_code_certification: (f) => f.donnee_source.code_certification,
          ...getStatsAsColumns(ALL_WITHOUT_INCOME),
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
    "/api/inserjeunes/regionales{.:ext}",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, regions, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.regions(),
          ...validators.statsList([getLastMillesimesRegionales()]),
        },
        { code_certifications: formatCodesCertifications }
      );

      const paginable = await RegionaleStatsRepository.findAndPaginate(
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
    "/api/inserjeunes/regionales/:region{.:ext}",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { region, millesimes, code_certifications, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.region(),
          ...validators.statsList([getLastMillesimesRegionales()]),
        },
        { code_certifications: formatCodesCertifications }
      );

      const paginable = await RegionaleStatsRepository.findAndPaginate(
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
    "/api/inserjeunes/regionales/:region/certifications/:codes_certifications{.:ext}",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { region, codes_certifications, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.region(),
          ...validators.codesCertifications(),
          ...validators.universe(),
          ...validators.millesime(getLastMillesimesRegionales()),
          ...validators.vues(),
          ...validators.svg(),
        },
        { codes_certifications: formatCodesCertifications }
      );

      if (vue === "filieres" || codes_certifications.length > 1) {
        return sendImageOnError(
          async () => {
            const filieresStats = await regionaleFilieresStats({ codes_certifications, millesime, region });
            await sendFilieresStats(filieresStats, res, options);
          },
          res,
          { type: "regionales", regionCode: region },
          options
        );
      }

      return sendImageOnError(
        async () => {
          const stats = await regionaleStats({ codes_certifications, region, millesime });
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
