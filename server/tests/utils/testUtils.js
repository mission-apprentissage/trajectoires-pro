const server = require("../../src/http/server");
const axiosist = require("axiosist"); // eslint-disable-line node/no-unpublished-require
const { Readable } = require("stream"); // eslint-disable-line node/no-unpublished-require

async function startServer() {
  const app = await server();
  const httpClient = axiosist(app);

  return {
    httpClient,
  };
}

let createStream = (content) => {
  let stream = new Readable({
    objectMode: true,
    read() {},
  });

  stream.push(content);
  stream.push(null);

  return stream;
};

module.exports = {
  startServer,
  createStream,
};
