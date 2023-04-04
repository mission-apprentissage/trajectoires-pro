import { compose } from "oleoduc";
import iconv from "iconv-lite";
import { parseCsv } from "../utils/csvUtils.js";
import { createReadStream } from "fs";

export async function fetchEtablissements(file) {
  let stream = compose(createReadStream(file), iconv.decodeStream("iso-8859-1"));
  return compose(stream, parseCsv({ delimiter: ";" }));
}
