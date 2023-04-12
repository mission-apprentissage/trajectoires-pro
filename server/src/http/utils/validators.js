import Joi from "joi";
import { getRegions } from "../../common/regions.js";
import { formatArrayParameters } from "./formatters.js";

const customJoi = Joi.extend((joi) => ({
  type: "arrayOf",
  base: joi.array(),
  // eslint-disable-next-line no-unused-vars
  coerce(value, helpers) {
    return { value: formatArrayParameters(value) };
  },
}));

export function arrayOf(itemSchema = Joi.string()) {
  return customJoi.arrayOf().items(itemSchema).single();
}

export function regions() {
  return {
    regions: arrayOf(Joi.string().valid(...getRegions().map((r) => r.code))).default([]),
  };
}

export function region() {
  return {
    region: Joi.string().valid(...getRegions().map((r) => r.code)),
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
