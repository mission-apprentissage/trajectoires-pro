import { compose, transformData } from "oleoduc";
import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";

import { fetchStream } from "../utils/httpUtils.js";

export const baseUrl = "https://catalogue-apprentissage.intercariforef.org/api/entity/";
export const etablissementsUrl = `${baseUrl}etablissements.json?limit=0`;

export async function fetchEtablissements() {
  return compose(
    await fetchStream(etablissementsUrl),
    streamJson.parser(),
    streamers.streamArray(),
    transformData((data) => {
      return data.value;
    })
  );
}
