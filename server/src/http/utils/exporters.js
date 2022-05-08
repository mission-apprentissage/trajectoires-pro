const { compose, transformIntoCSV, transformIntoJSON } = require("oleoduc");
const { DateTime } = require("luxon");

function sendAsJson(res) {
  res.setHeader("Content-Type", `application/json`);
  return compose(transformIntoJSON(), res);
}

function sendAsCSV(res, options = {}) {
  let { filename, ...rest } = options;
  let fullname = `${filename || "export"}-${DateTime.now().toISODate()}.csv`;
  res.setHeader("Content-disposition", `attachment; filename=${fullname}`);
  res.setHeader("Content-Type", `text/csv; charset=UTF-8`);
  return compose(transformIntoCSV(rest), res);
}

module.exports = {
  sendAsJson,
  sendAsCSV,
};
