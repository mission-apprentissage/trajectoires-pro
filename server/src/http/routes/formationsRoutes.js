import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import Joi from "joi";
import Boom from "boom";
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
import {
  getRouteDate,
  getFormations,
  buildFiltersEtablissement,
  buildFiltersFormation,
} from "#src/queries/getFormations.js";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import FormationEtablissement from "#src/common/repositories/formationEtablissement.js";
import Etablissement from "#src/common/repositories/etablissement.js";
import Formation from "#src/common/repositories/formation.js";
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
        ...options
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
          options,
          data,
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

      const formationInfo = await Formation.first({ cfd, voie, codeDispositif });
      if (!formationInfo) {
        throw Boom.notFound();
      }

      addJsonHeaders(res);
      // TODO: add tags
      res.send({
        formation: {
          ...formationInfo,
          ...formation,
        },
        etablissement,
      });
    })
  );

  router.get(
    "/api/formations",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { longitude, latitude, distance, timeLimit, tag, uais, cfds, page, items_par_page } = await validate(
        { ...req.query, ...req.params },
        {
          longitude: Joi.number().min(-180).max(180).default(null),
          latitude: Joi.number().min(-90).max(90).default(null),
          distance: Joi.number().min(0).max(100000).default(null),
          timeLimit: Joi.number().min(0).max(7200).default(null),
          tag: Joi.string()
            .empty("")
            .valid(...Object.values(FORMATION_TAG))
            .default(null),
          ...validators.uais(),
          ...validators.cfds(),
          ...validators.pagination({ items_par_page: 100 }),
        }
      );

      const year = new Date().getFullYear();
      const millesime = [(year - 1).toString(), year.toString()];

      const filtersEtablissement = await buildFiltersEtablissement({ timeLimit, distance, latitude, longitude, uais });

      // Formations filter
      const filtersFormation = await buildFiltersFormation({ cfds });

      const paginatedFormations = await getFormations(
        {
          filtersEtablissement: filtersEtablissement,
          filtersFormation: filtersFormation,
          tag,
          millesime,
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

  // TODO: move in another route
  router.get(
    "/api/formation/route",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { longitudeA, latitudeA, longitudeB, latitudeB } = await validate(
        { ...req.query, ...req.params },
        {
          longitudeA: Joi.number().min(-180).max(180).required(),
          latitudeA: Joi.number().min(-90).max(90).required(),
          longitudeB: Joi.number().min(-180).max(180).required(),
          latitudeB: Joi.number().min(-90).max(90).required(),
        }
      );

      const graphHopperApi = new GraphHopperApi();

      const graphHopperParameter = {
        pointA: `${latitudeA},${longitudeA}`,
        pointB: `${latitudeB},${longitudeB}`,
        departureTime: getRouteDate(),
      };
      const route = await graphHopperApi.fetchRoute(graphHopperParameter);

      addJsonHeaders(res);
      res.send(route);
    })
  );
  return router;
};
