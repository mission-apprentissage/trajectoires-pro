const Joi = require("joi");

const customJoi = Joi.extend((joi) => ({
  type: "arrayOf",
  base: joi.array(),
  // eslint-disable-next-line no-unused-vars
  coerce(value, helpers) {
    return { value: value.split ? value.split(",") : value };
  },
}));

function arrayOf(itemSchema = Joi.string()) {
  return customJoi.arrayOf().items(itemSchema).single();
}

function exports() {
  return {
    ext: Joi.string().valid("json", "csv").default("json"),
  };
}

module.exports = {
  arrayOf,
  exports,
};
