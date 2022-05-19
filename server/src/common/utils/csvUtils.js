import { parse } from "csv-parse";
import { pickBy, isEmpty } from "lodash-es";

export function parseCsv(options = {}) {
  return parse({
    trim: true,
    delimiter: ";",
    columns: true,
    on_record: (record) => {
      return pickBy(record, (v) => {
        return !isEmpty(v) && v.trim().length;
      });
    },
    ...options,
  });
}
