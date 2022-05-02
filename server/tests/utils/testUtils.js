const models = require("../../src/common/model");
const server = require("../../src/http/server");
const axiosist = require("axiosist"); // eslint-disable-line node/no-unpublished-require

async function startServer() {
  const app = await server();
  const httpClient = axiosist(app);

  return {
    httpClient,
  };
}

function cleanAll() {
  return Promise.all(Object.values(models).map((m) => m.deleteMany()));
}

module.exports = {
  startServer,
  cleanAll,
};
