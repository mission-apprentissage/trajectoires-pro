import express from "express";
import { omit } from "lodash-es";
import { compose, transformIntoCSV, transformIntoJSON, transformData } from "oleoduc";
import { tryCatch } from "../middlewares/tryCatchMiddleware.js";
import * as validators from "../utils/validators.js";
import { validate } from "../utils/validators.js";
import { checkApiKey } from "../middlewares/authMiddleware.js";
import { addCsvHeaders, addJsonHeaders } from "../utils/responseUtils.js";
import BCNRepository from "../../common/repositories/bcn.js";
import moment from "moment-timezone";

export default () => {
  const router = express.Router();

  router.get(
    "/api/inserjeunes/bcn.:ext?",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { page, items_par_page, ext } = await validate(
        { ...req.query, ...req.params },
        {
          ...validators.exports(),
          ...validators.pagination(),
        }
      );

      let { find, pagination } = await BCNRepository.findAndPaginate(
        {},
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
            type: (f) => f.type,
            code_formation_diplome: (f) => f.code_formation_diplome,
            libelle: (f) => f.libelle,
            libelle_long: (f) => f.libelle_long,
            diplome_libelle: (f) => f.diplome?.libelle,
            date_ouverture: (f) => moment(f.date_ouverture).tz("Europe/Paris").format(),
            date_fermerture: (f) => f.date_fermerture && moment(f.date_fermerture).tz("Europe/Paris").format(),
            date_premiere_session: (f) => f.date_premiere_session,
            date_derniere_session: (f) => f.date_derniere_session,
          },
          mapper: (v) => (v === null ? "" : v),
        });
      } else {
        addJsonHeaders(res);
        extensionTransformer = transformIntoJSON({
          arrayPropertyName: "bcn",
          arrayWrapper: {
            pagination,
          },
        });
      }

      return compose(
        find,
        transformData((data) => omit(data, "_id", "_meta")),
        extensionTransformer,
        res
      );
    })
  );

  return router;
};
