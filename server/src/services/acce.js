import { compose } from "oleoduc";
import iconv from "iconv-lite";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { createReadStream } from "fs";
import config from "#src/config.js";

export function etablissements(filePath = null) {
  const stream = compose(
    createReadStream(filePath || config.acce.files.etablissements),
    iconv.decodeStream("iso-8859-1")
  );
  return compose(stream, parseCsv({ delimiter: ";" }));
}
