const express = require("express");
const tryCatch = require("../middlewares/tryCatchMiddleware");
const Joi = require("joi");
const InsertJeunesApi = require("../../common/api/InsertJeunesApi");
const { compose, transformIntoJSON, accumulateData, flattenArray, transformData } = require("oleoduc");
const { arrayOf } = require("../utils/validators");
const { pick } = require("lodash");
const { checkApiKey } = require("../middlewares/authMiddleware");

function getFormationStats(codeFormations) {
  return compose(
    transformData((data) => {
      const count = data.dimensions.filter((d) => {
        let value = d["id_formation_apprentissage"] || d["id_mefstat11"];
        return value && (codeFormations.length === 0 || codeFormations.includes(value));
      }).length;

      return count === 0
        ? null // ignore it
        : {
            ...pick(data, ["id_mesure", "valeur_mesure"]),
            code_formation: data.dimensions[0]["id_formation_apprentissage"] || data["id_mefstat11"],
          };
    }),
    accumulateData(
      (acc, data) => {
        let index = acc.findIndex((item) => item.code_formation === data.code_formation);

        if (index === -1) {
          acc.push({
            code_formation: data.code_formation,
            [data.id_mesure]: data.valeur_mesure,
          });
        } else {
          acc[index][data.id_mesure] = data.valeur_mesure;
        }

        return acc;
      },
      { accumulator: [] }
    ),
    flattenArray()
  );
}

module.exports = () => {
  const router = express.Router();
  const api = new InsertJeunesApi();

  router.get(
    "/api/insertjeunes/uai/:uai/millesime/:millesime",
    checkApiKey(),
    tryCatch(async (req, res) => {
      const { uai, millesime, codes_formations } = await Joi.object({
        uai: Joi.string()
          .pattern(/^[0-9]{7}[A-Z]{1}$/)
          .required(),
        millesime: Joi.string().required(),
        codes_formations: arrayOf(Joi.string().required()).default([]),
      }).validateAsync({ ...req.query, ...req.params }, { abortEarly: false });

      return compose(
        await api.statsParEtablissement(uai, millesime),
        getFormationStats(codes_formations),
        transformIntoJSON({ arrayWrapper: { uai, millesime }, arrayPropertyName: "formations" }),
        res
      );
    })
  );

  return router;
};
