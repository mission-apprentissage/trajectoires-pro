import { DateTime } from "luxon";

export function addJsonHeaders(res) {
  res.setHeader("Content-Type", `application/json`);
}

export function addCsvHeaders(res, options = {}) {
  let fullname = `${options.filename || "export"}-${DateTime.now().toISODate()}.csv`;
  res.setHeader("Content-disposition", `attachment; filename=${fullname}`);
  res.setHeader("Content-Type", `text/csv; charset=UTF-8`);
}
