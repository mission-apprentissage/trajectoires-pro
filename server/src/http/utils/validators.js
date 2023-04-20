import Joi from "joi";
import { getRegions, findRegionByCodePostal } from "../../common/regions.js";
import { formatArrayParameters } from "./formatters.js";

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

export function regions() {
  return {
    regions: arrayOf(customJoi.postalCodeToRegion().valid(...getRegions().map((r) => r.code))).default([]),
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

export function pagination() {
  return {
    items_par_page: Joi.number().default(10),
    page: Joi.number().default(1),
  };
}

export function svg() {
  return {
    direction: Joi.string().valid("horizontal", "vertical"),
    theme: Joi.string().valid("dsfr", "lba"),
    ext: Joi.string().valid("svg"),
    imageOnError: Joi.boolean().default(false),
  };
}
export function vues() {
  return {
    vue: Joi.string().valid("filieres"),
  };
}

export function statsList() {
  return {
    millesimes: arrayOf(Joi.string().required()).default([]),
    code_certifications: arrayOf(Joi.string().required()).default([]),
    ...exports(),
    ...pagination(),
  };
}

export function validate(obj, validators) {
  return Joi.object(validators).validateAsync(obj, { abortEarly: false });
}
