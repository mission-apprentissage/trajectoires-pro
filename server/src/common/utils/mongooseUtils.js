const { Schema } = require("mongoose");

function nested(definition, options = {}) {
  return new Schema(definition, { _id: false, ...options });
}

module.exports = {
  nested,
};
