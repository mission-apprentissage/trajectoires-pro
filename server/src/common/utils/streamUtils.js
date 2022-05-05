const { compose, transformData } = require("oleoduc");
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const { streamArray } = require("stream-json/streamers/StreamArray");
const { parseCsv } = require("./csvUtils");

module.exports = {
  streamNestedJsonArray: (arrayPropertyName) => {
    return compose(
      parser(),
      pick({ filter: arrayPropertyName }),
      streamArray(),
      transformData((data) => {
        return data.value;
      })
    );
  },
  readCSV: (stream) => {
    return compose(stream, parseCsv());
  },
};
