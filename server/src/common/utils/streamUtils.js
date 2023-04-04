import { compose, transformData, accumulateData } from "oleoduc";
import streamJson from "stream-json";
import jsonFilters from "stream-json/filters/Pick.js";
import streamers from "stream-json/streamers/StreamArray.js";
import streamObject from "stream-json/streamers/StreamObject.js";
import { parseCsv } from "./csvUtils.js";

export function readCSV(stream) {
  return compose(stream, parseCsv());
}

export function streamNestedJsonArray(arrayPropertyName) {
  return compose(
    streamJson.parser(),
    jsonFilters.pick({ filter: arrayPropertyName }),
    streamers.streamArray(),
    transformData((data) => data.value)
  );
}

export function streamNestedJson(propertyName) {
  return compose(
    streamJson.parser(),
    jsonFilters.pick({ filter: propertyName }),
    streamObject.streamObject(),
    accumulateData(
      (acc, data) => {
        return { ...acc, [data.key]: data.value };
      },
      { accumulator: {} }
    )
  );
}
