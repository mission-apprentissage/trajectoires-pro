import { compose } from "oleoduc";
import iconv from "iconv-lite";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { createReadStream } from "fs";
import config from "#src/config.js";

export function constatRentree(filePath = null) {
  const stream = compose(
    createReadStream(filePath || config.educationGouv.files.constatRentree),
    iconv.decodeStream("utf8")
  );
  return compose(stream, parseCsv({ delimiter: ";" }));
}
