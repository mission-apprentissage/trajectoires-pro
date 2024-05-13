import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import Joi from "joi";
import moment from "moment";
import Boom from "boom";
import { flatten } from "lodash-es";
import * as validators from "#src/http/utils/validators.js";
import { validate } from "#src/http/utils/validators.js";
import { addCsvHeaders, addJsonHeaders, sendStats, sendImageOnError } from "#src/http/utils/responseUtils.js";
import {
  formatMillesime,
  formatCodesCertifications,
  formatCodeCertificationWithType,
} from "#src/http/utils/formatters.js";
import { compose, transformIntoCSV, transformIntoJSON } from "oleoduc";
import { getStatsAsColumns } from "#src/common/utils/csvUtils.js";
import {
  getLastMillesimesFormations,
  getLastMillesimesFormationsSup,
  transformDisplayStat,
} from "#src/common/stats.js";
import BCNRepository from "#src/common/repositories/bcn.js";
import BCNSiseRepository from "#src/common/repositories/bcnSise.js";
import FormationStatsRepository from "#src/common/repositories/formationStats.js";
import AcceEtablissementRepository from "#src/common/repositories/acceEtablissement.js";
import {
  ErrorFormationNotFound,
  ErrorNoDataForMillesime,
  ErrorFormationNotExist,
  ErrorEtablissementNotExist,
} from "#src/http/errors.js";
import { getUserWidget, getIframe } from "#src/services/widget/widgetUser.js";
import { formatDataWidget } from "#src/http/utils/widgetUtils.js";
import { getFormations, getDistanceFilter, getTimeFilter } from "#src/queries/getFormations.js";
import { FORMATION_TAG } from "#src/queries/formationTag.js";

import FormationEtablissement from "#src/common/repositories/formationEtablissement.js";
import Etablissement from "#src/common/repositories/etablissement.js";
import { GraphHopperApi } from "#src/services/graphHopper/graphHopper.js";

async function formationStats({ uai, codeCertificationWithType, millesime }) {
  const { type, code_certification } = codeCertificationWithType;

  const result = await FormationStatsRepository.first({
    uai,
    code_certification: code_certification,
    millesime: formatMillesime(millesime),
  });

  if (!result) {
    const existFormation =
      type === "sise"
        ? await BCNSiseRepository.exist({ diplome_sise: code_certification })
        : await BCNRepository.exist({ code_certification });

    if (!existFormation) {
      throw new ErrorFormationNotExist();
    }

    const existEtablissement = await AcceEtablissementRepository.exist({ numero_uai: uai });
    if (!existEtablissement) {
      throw new ErrorEtablissementNotExist();
    }

    const exist = await FormationStatsRepository.exist({
      uai,
      code_certification,
    });

    if (!exist) {
      throw new ErrorFormationNotFound();
    }

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
          ...validators.statsList([]),
        },
        { code_certifications: formatCodesCertifications }
      );

      let { find, pagination } = await FormationStatsRepository.findAndPaginate(
        {
          uai: uais,
          region: regions,
          "academie.code": academies,

          code_certification: code_certifications,
          ...(millesimes.length === 0
            ? {
                $or: [
                  { filiere: "superieur", millesime: getLastMillesimesFormationsSup() },
                  { filiere: { $ne: "superieur" }, millesime: getLastMillesimesFormations() },
                ],
              }
            : {
                millesime: millesimes,
              }),
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
      const {
        uai,
        code_certification,
        millesime: millesimeBase,
        ...options
      } = await validate(
        { ...req.params, ...req.query },
        {
          ...validators.uai(),
          ...validators.codeCertification(),
          ...validators.universe(),
          millesime: Joi.string().default(null),
          ...validators.svg(),
        }
      );
      const codeCertificationWithType = formatCodeCertificationWithType(code_certification);
      const millesime =
        millesimeBase ||
        (codeCertificationWithType.filiere === "superieur" && getLastMillesimesFormationsSup()) ||
        getLastMillesimesFormations();

      return sendImageOnError(
        async () => {
          const stats = await formationStats({ uai, codeCertificationWithType, millesime });
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
      const {
        hash,
        theme,
        uai,
        code_certification,
        millesime: millesimeBase,
      } = await validate(
        { ...req.params, ...req.query },
        {
          hash: Joi.string(),
          ...validators.uai(),
          ...validators.codeCertification(),
          millesime: Joi.string().default(""),
          ...validators.widget("stats"),
        }
      );

      const codeCertificationWithType = formatCodeCertificationWithType(code_certification);
      const millesime =
        millesimeBase ||
        (codeCertificationWithType.filiere === "superieur" && getLastMillesimesFormationsSup()) ||
        getLastMillesimesFormations();

      try {
        const stats = await formationStats({ uai, codeCertificationWithType, millesime });
        const etablissement = await AcceEtablissementRepository.first({ numero_uai: uai });
        const data = await formatDataWidget({ stats, millesime, etablissement });

        const widget = await getUserWidget({
          hash,
          name: "stats",
          theme,
          data,
          options,
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
        const widget = await getUserWidget({
          hash,
          name: "error",
          theme,
          options,
          data: {
            error: err.name,
            millesimes: formatMillesime(millesime).split("_"),
            code_certification,
            uai,
          },
        });
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
          ...validators.codeCertification(),
          millesime: Joi.string().default(null),
          ...validators.widget("stats"),
        }
      );

      const widget = getIframe({
        user: req.user,
        parameters: { theme, millesime },
        path: req.path,
      });

      res.setHeader("content-type", "text/html");
      return res.status(200).send(widget);
    })
  );

  router.get(
    "/api/formation/:cfd-:codeDispositif?-:uai-:voie",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { cfd, codeDispositif, uai, voie } = await validate(
        { ...req.params, ...req.query },
        {
          cfd: Joi.string().required(),
          codeDispositif: Joi.string().allow(null, "").default(null),
          ...validators.uai(),
          voie: Joi.string().valid("scolaire", "apprentissage").required(),
        }
      );

      const formation = await FormationEtablissement.first({
        uai,
        cfd,
        codeDispositif,
        voie,
      });
      if (!formation) {
        throw Boom.notFound();
      }

      const etablissement = await Etablissement.first({ uai });
      if (!etablissement) {
        throw Boom.notFound();
      }

      const bcn = await BCNRepository.first({ code_formation_diplome: cfd, type: "cfd" });
      if (!bcn) {
        throw Boom.notFound();
      }

      addJsonHeaders(res);
      // TODO: add tags
      res.send({
        formation: {
          tags: [],
          ...formation,
        },
        etablissement,
        bcn,
      });
    })
  );

  router.get(
    "/api/formations",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { longitude, latitude, distance, timeLimit, tag, codesDiplome, page, items_par_page } = await validate(
        { ...req.query, ...req.params },
        {
          longitude: Joi.number().min(-180).max(180).required(),
          latitude: Joi.number().min(-90).max(90).required(),
          distance: Joi.number().min(0).max(100000).default(1000),
          timeLimit: Joi.number().min(0).max(7200).default(null),
          tag: Joi.string()
            .empty("")
            .valid(...flatten(Object.values(FORMATION_TAG).map((t) => t.tags)))
            .default(null),
          ...validators.codesDiplome(),
          ...validators.pagination({ items_par_page: 100 }),
        }
      );

      const year = new Date().getFullYear();
      const millesime = [(year - 1).toString(), year.toString()];

      let filtersEtablissement = [];

      if (timeLimit) {
        const buckets = [7200, 3600, 1800, 900];
        const graphHopperApi = new GraphHopperApi();
        try {
          const isochroneBuckets = await graphHopperApi.fetchIsochronePTBuckets({
            point: `${latitude},${longitude}`,
            departureTime: moment().set("hour", 7).set("minute", 0).toDate(),
            buckets: buckets.filter((b) => b <= timeLimit),
            reverse_flow: true,
          });

          filtersEtablissement.push(getTimeFilter({ coordinate: { longitude, latitude }, isochroneBuckets }));
          //  filter = testTimeFilter({ coordinate: { longitude, latitude } });
        } catch (err) {
          console.error(err);
          // TODO : gestion des erreurs de récupération de l'isochrone
          filtersEtablissement.push(getDistanceFilter({ coordinate: { longitude, latitude }, maxDistance: distance }));
        }
      } else {
        filtersEtablissement.push(getDistanceFilter({ coordinate: { longitude, latitude }, maxDistance: distance }));
      }

      // Formations filter
      const filtersFormation = [];

      const paginatedFormations = await getFormations(
        {
          filtersEtablissement: filtersEtablissement,
          filtersFormation: filtersFormation,
          tag,
          millesime,
          codesDiplome,
        },
        {
          limit: items_par_page,
          page,
        }
      );

      addJsonHeaders(res);
      res.send(paginatedFormations);
    })
  );
  return router;
};
