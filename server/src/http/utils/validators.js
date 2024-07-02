import Joi from "joi";
import { getRegions, findRegionByCodePostal, getAcademies } from "#src/services/regions.js";
import { formatArrayParameters } from "./formatters.js";
import { WIDGETS } from "#src/services/widget/widget.js";
import { ANCIENS_NIVEAUX_MAPPER } from "#src/services/bcn.js";

const UAI_PATTERN = /^[0-9]{7}[A-Z]{1}$/;
const CFD_PATTERN = /^[0-9A-Z]{8}$/;

const customJoi = Joi.extend(
  (joi) => ({
    type: "arrayOf",
    base: joi.array(),
    // eslint-disable-next-line no-unused-vars
    coerce(value, helpers) {
      return { value: formatArrayParameters(value) };
    },
  }),
  (joi) => ({
    type: "postalCodeToRegion",
    base: joi.string(),
    messages: {
      "postal_code.invalid": "{{#label}} must be a valid postal code or region code",
    },
    // eslint-disable-next-line no-unused-vars
    coerce(value, helpers) {
      if (value.length !== 5) {
        return { value };
      }

      const region = findRegionByCodePostal(value)?.code;

      return { value: region, errors: !region ? helpers.error("postal_code.invalid") : null };
    },
  })
);

export function arrayOf(itemSchema = Joi.string()) {
  return customJoi.arrayOf().items(itemSchema).single();
}

export function uai() {
  return {
    uai: Joi.string().pattern(UAI_PATTERN).required(),
  };
}

export function uais() {
  return {
    uais: arrayOf(Joi.string().pattern(UAI_PATTERN).required()).default([]),
  };
}

export function cfds() {
  return {
    cfds: arrayOf(Joi.string().pattern(CFD_PATTERN).required()).default([]),
  };
}

export function codesDiplome() {
  return {
    codesDiplome: arrayOf(Joi.string().valid(...Object.values(ANCIENS_NIVEAUX_MAPPER))).default([]),
  };
}

export function regions() {
  return {
    regions: arrayOf(customJoi.postalCodeToRegion().valid(...getRegions().map((r) => r.code))).default([]),
  };
}

export function academies() {
  return {
    academies: arrayOf(Joi.valid(...getAcademies().map((a) => a.code)))
      .default([])
      .messages({
        "any.only": "{{#label}} must be a valid academie code",
      }),
  };
}

export function region() {
  return {
    region: customJoi.postalCodeToRegion().valid(...getRegions().map((r) => r.code)),
  };
}

export function exports() {
  return {
    ext: Joi.string().valid("json", "csv").default("json"),
  };
}

export function pagination({ items_par_page, page } = {}) {
  return {
    items_par_page: Joi.number().default(items_par_page ?? 10),
    page: Joi.number().default(page ?? 1),
  };
}

export function svg() {
  return {
    direction: Joi.string().valid("horizontal", "vertical"),
    theme: Joi.string().valid("dsfr", "lba"),
    ext: Joi.string().valid("svg"),
    imageOnError: Joi.string().empty(["", null]).valid("true", "false", "empty").default("false"),
  };
}

export function widget(type) {
  return {
    theme: Joi.string()
      .empty(["", null])
      .custom((value, helper) => {
        if (!WIDGETS[type].variant[value]) {
          return helper.message(`Le theme ${value} n'existe pas.`);
        }

        return value;
      }),
    ...(WIDGETS[type] && WIDGETS[type].options ? WIDGETS[type].options : {}),
  };
}

export function vues() {
  return {
    vue: Joi.string().valid("filieres"),
  };
}

export function statsList(defaultMillesimes = []) {
  return {
    millesimes: arrayOf(Joi.string().required()).default(defaultMillesimes),
    code_certifications: arrayOf(Joi.string().required()).default([]),
    ...exports(),
    ...pagination(),
  };
}

export function validate(obj, validators) {
  return Joi.object(validators).validateAsync(obj, { abortEarly: false });
}
