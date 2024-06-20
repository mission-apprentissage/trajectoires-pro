import Joi from "joi";
import { mapValues } from "lodash-es";
import { getRegions, findRegionByCodePostal, getAcademies } from "#src/services/regions.js";
import { formatArrayParameters } from "./formatters.js";
import { WIDGETS } from "#src/services/widget/widget.js";

const UAI_PATTERN = /^[0-9]{7}[A-Z]{1}$/;
export const CFD_PATTERN = /^(?:CFD:)?([0-9]{8})$/;
export const MEF11_PATTERN = /^(?:MEFSTAT11:)?([0-9]{11})$/;
export const SISE_PATTERN = /^SISE:([0-9]{7})$/;
export const CODE_CERTIFICATION_PATTERNS = [
  {
    type: "cfd",
    filiere: "apprentissage",
    pattern: CFD_PATTERN,
  },
  {
    type: "mef11",
    filiere: "pro",
    pattern: MEF11_PATTERN,
  },
  {
    type: "sise",
    filiere: "superieur",
    pattern: SISE_PATTERN,
  },
];

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
  }),

  (joi) => ({
    type: "codeCertification",
    base: joi.string(),
    messages: {
      "code_certification.invalid": "{{#label}} must be a valid certification code.",
    },
    // eslint-disable-next-line no-unused-vars
    coerce(value, helpers) {
      const errors = ![CFD_PATTERN, MEF11_PATTERN, SISE_PATTERN].some((r) => r.test(value));
      return { value: value, errors: errors ? helpers.error("code_certification.invalid") : null };
    },
  }),

  (joi) => ({
    type: "codesCertification",
    base: joi.arrayOf().items(joi.codeCertification().required()).single().default([]),
    messages: {
      "codes_certification.invalid": "{{#label}} must have the type CFD, MEFSTAT11 or SISE",
    },
    validate(value, helpers) {
      const errors = value.some((v) => {
        return ![CFD_PATTERN, MEF11_PATTERN, SISE_PATTERN].some((r) => r.test(v));
      });

      return { value, errors: errors ? helpers.error("codes_certification.invalid") : null };
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

export function universe(key = "codes_certifications") {
  return {
    universe: Joi.when(key, {
      switch: [
        {
          is: Joi.array().items(
            Joi.alternatives().try(Joi.string().pattern(CFD_PATTERN), Joi.string().pattern(MEF11_PATTERN))
          ),
          then: Joi.string().valid("secondaire").default("secondaire"),
        },
        {
          is: Joi.array().items(Joi.string().pattern(SISE_PATTERN)),
          then: Joi.string().valid("superieur").default("superieur"),
        },
      ],
    }),
  };
}

export function codeCertification() {
  return {
    code_certification: customJoi.codeCertification().required(),
  };
}

export function codesCertifications() {
  return {
    codes_certifications: customJoi.codesCertification().min(1),
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
    code_certifications: customJoi.codesCertification(),
    ...universe("code_certifications"),
    ...exports(),
    ...pagination(),
  };
}

export async function validate(obj, validators, formatters = {}) {
  const parameters = await Joi.object(validators).validateAsync(obj, { abortEarly: false });
  return mapValues(parameters, (parameter, key) => (formatters[key] ? formatters[key](parameter) : parameter));
}
