import unzipper from "unzipper";
import { compose, transformIntoStream, transformData } from "oleoduc";
import iconv from "iconv-lite";
import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";
import { Readable } from "stream";
import config from "#src/config.js";
import { DataGouvApi } from "./DataGouvApi.js";

export async function streamRomes(options = {}) {
  const api = options.api || new DataGouvApi(options.apiOptions || {});
  const stream = await api.datasets(config.datagouv.datasets.rome);

  return compose(
    stream,
    unzipper.Parse(),
    transformIntoStream(async (entry) => {
      const filename = entry.path;
      if (filename.startsWith("unix_referentiel_code_rome_")) {
        return entry;
      } else {
        entry.autodrain();
        return Readable.from([]);
      }
    }),
    iconv.decodeStream("iso-8859-1"),
    streamJson.parser(),
    streamers.streamArray(),
    transformData((data) => data.value)
  );
}
