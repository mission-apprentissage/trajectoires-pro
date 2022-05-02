const { Schema, model } = require("mongoose");

const Log = model(
  "Log",
  new Schema({
    __v: { type: Number, select: false },
    msg: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      expires: "7d", // mongo will auto-remove data after 7 days
      required: true,
    },
  }),
  "logs"
);

module.exports = Log;
