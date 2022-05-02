const { Schema, model } = require("mongoose");

const Sample = model(
  "Sample",
  new Schema({
    __v: { type: Number, select: false },
    property1: {
      type: String,
      default: null,
      description: "Valeur de test",
    },
  }),
  "samples"
);

module.exports = Sample;
