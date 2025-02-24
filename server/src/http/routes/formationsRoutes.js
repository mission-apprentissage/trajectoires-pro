import express from "express";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import Joi from "joi";
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
  getLastMillesimesFormationsYearFor,
  getMillesimeFormationsFrom,
  getMillesimeFormationsYearFrom,
  transformDisplayStat,
  isMillesimesYearSingle,
  ALL_WITHOUT_INCOME,
  statsAnneeTerminale,
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
import { getUserWidget, getIframe, getUserStatsWidget } from "#src/services/widget/widgetUser.js";
import { formatDataWidget } from "#src/http/utils/widgetUtils.js";

async function formationStats({ uai, codeCertificationWithType, millesime, fetchAnneesTerminales = false }) {
  const { type, code_certification } = codeCertificationWithType;

  const result = await FormationStatsRepository.first({
    uai,
    code_certification: code_certification,
    millesime: [
      millesime,
      isMillesimesYearSingle(millesime)
        ? getMillesimeFormationsFrom(millesime)
        : getMillesimeFormationsYearFrom(millesime),
    ],
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

  // Récupère les données de l'année terminale automatiquement
  if (fetchAnneesTerminales && result.certificationsTerminales) {
    return await statsAnneeTerminale(formationStats, result, { uai, millesime }, (params) => {
      return { codeCertificationWithType: { code_certification: params.codes_certifications[0], type }, ...params };
    });
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
                  {
                    filiere: "superieur",
                    millesime: {
                      $in: [
                        getMillesimeFormationsYearFrom(getLastMillesimesFormationsSup()),
                        getLastMillesimesFormationsSup(),
                      ],
                    },
                  },
                  {
                    filiere: { $ne: "superieur" },
                    millesime: {
                      $in: [
                        getMillesimeFormationsYearFrom(getLastMillesimesFormations()),
                        getLastMillesimesFormations(),
                      ],
                    },
                  },
                ],
              }
            : {
                millesime: flatten(
                  millesimes.map((m) => {
                    return [
                      m,
                      isMillesimesYearSingle(m) ? getMillesimeFormationsFrom(m) : getMillesimeFormationsYearFrom(m),
                    ];
                  })
                ),
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
          ...validators.millesime(null),
          ...validators.svg(),
        }
      );
      const codeCertificationWithType = formatCodeCertificationWithType(code_certification);
      const millesime = formatMillesime(
        millesimeBase || getLastMillesimesFormationsYearFor(codeCertificationWithType.filiere)
      );

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
          ...validators.millesime(null),
          ...validators.widget("stats"),
        }
      );

      const codeCertificationWithType = formatCodeCertificationWithType(code_certification);
      const millesime = formatMillesime(
        millesimeBase || getLastMillesimesFormationsYearFor(codeCertificationWithType.filiere)
      );

      try {
        const stats = await formationStats({ uai, codeCertificationWithType, millesime, fetchAnneesTerminales: true });
        const etablissement = await AcceEtablissementRepository.first({ numero_uai: uai });
        const data = formatDataWidget({ stats, etablissement });

        const widget = await getUserStatsWidget({
          code_certification: codeCertificationWithType.code_certification,
          millesime,
          hash,
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
            millesimes: millesime.split("_"),
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
          ...validators.millesime(null),
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
  return router;
};
