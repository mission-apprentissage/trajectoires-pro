import { compose, transformData } from "oleoduc";
import { fetchStream } from "./utils/httpUtils.js";
import iconv from "iconv-lite";
import { parseCsv } from "./utils/csvUtils.js";

export async function getBCNTable(tableName, options = {}) {
  let stream =
    options[tableName] ||
    compose(
      await fetchStream(
        `https://infocentre.pleiade.education.fr/bcn/index.php/export/CSV?n=${tableName}&separator=%7C`
      ),
      iconv.decodeStream("iso-8859-1")
    );

  return compose(
    stream,
    transformData(
      (data) => {
        return data.toString().replace(/"/g, "'");
      },
      { objectMode: false }
    ),
    parseCsv({ delimiter: "|" })
  );
}
