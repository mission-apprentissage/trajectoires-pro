const { pickBy, isNil } = require("lodash");

function omitNil(obj) {
  return pickBy(obj, (v) => !isNil(v));
}

module.exports = {
  omitNil,
};
