import { compose } from "oleoduc";
import iconv from "iconv-lite";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import config from "#src/config.js";
import { DataGouvApi } from "./DataGouvApi.js";

export async function streamCertifInfo(options = {}) {
  const api = options.api || new DataGouvApi(options.apiOptions || {});
  const stream = await api.datasets(config.datagouv.datasets.certifinfo);

  return compose(stream, iconv.decodeStream("iso-8859-1"), parseCsv({ delimiter: ";", quote: null }));
}
