import express from "express";
import Joi from "joi";
import { mapValues } from "lodash-es";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { formatMillesime } from "#src/http/utils/formatters.js";
import {
  addCsvHeaders,
  addJsonHeaders,
  sendFilieresStats,
  sendStats,
  sendImageOnError,
} from "#src/http/utils/responseUtils.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import { getLastMillesimesRegionales, transformDisplayStat, buildDescription } from "#src/common/stats.js";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import RegionaleStatsRepository from "#src/common/repositories/regionaleStats.js";
import { ErrorRegionaleNotFound, ErrorNoDataForMillesime } from "#src/http/errors.js";
import { getUserWidget, getIframe } from "#src/services/widget/widgetUser.js";

async function regionaleStats({ codes_certifications, region, millesime }) {
  const code_certification = codes_certifications[0];
  const exist = await RegionaleStatsRepository.exist({ region, code_certification });
  if (!exist) {
    throw new ErrorRegionaleNotFound();
  }

  const result = await RegionaleStatsRepository.first({ region, code_certification, millesime });
  if (!result) {
    const millesimesAvailable = await RegionaleStatsRepository.findMillesime({ region, code_certification });
    throw new ErrorNoDataForMillesime(millesime, millesimesAvailable);
  }

  const stats = transformDisplayStat()(result);
  return stats;
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
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { millesimes, code_certifications, regions, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.regions(),
          ...validators.statsList([getLastMillesimesRegionales()]),
        }
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
    "/api/inserjeunes/regionales/:region.:ext?",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { region, millesimes, code_certifications, page, items_par_page, ...rest } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.region(),
          ...validators.statsList([getLastMillesimesRegionales()]),
        }
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
    "/api/inserjeunes/regionales/:region/certifications/:codes_certifications.:ext?",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { region, codes_certifications, millesime, vue, ...options } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.region(),
          codes_certifications: validators.arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(getLastMillesimesRegionales()),
          ...validators.vues(),
          ...validators.svg(),
        }
      );

      if (vue === "filieres" || codes_certifications.length > 1) {
        const cfds = await BCNRepository.findCodesFormationDiplome(codes_certifications);
        const filieresStats =
          cfds && cfds.length > 0
            ? mapValues(
                await RegionaleStatsRepository.getFilieresStats({
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
          const stats = await regionaleStats({ codes_certifications, region, millesime });
          return sendStats("certification", stats, res, options);
        },
        res,
        { type: "regionales", regionCode: region },
        options
      );
    })
  );

  router.get(
    "/api/inserjeunes/regionales/:region/certifications/:codes_certifications/widget/:hash",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { hash, theme, region, codes_certifications, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          hash: Joi.string(),
          ...validators.region(),
          codes_certifications: validators.arrayOf(Joi.string().required()).default([]).min(1),
          millesime: Joi.string().default(getLastMillesimesRegionales()),
          ...validators.vues(),
          ...validators.widget("stats"),
        }
      );

      try {
        const stats = await regionaleStats({ codes_certifications, region, millesime });
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
            region: stats.region,
          },
        });

        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      } catch (err) {
        // TODO: gestion des erreurs
        const widget = await getUserWidget({ hash, type: "error", theme });

        res.setHeader("content-type", "text/html");
        return res.status(200).send(widget);
      }
    })
  );

  router.get(
    "/api/inserjeunes/regionales/:region/certifications/:codes_certifications/widget",
    authMiddleware("private"),
    tryCatch(async (req, res) => {
      const { theme, millesime } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.region(),
          codes_certifications: validators.arrayOf(Joi.string().required()).default([]).min(1),
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
