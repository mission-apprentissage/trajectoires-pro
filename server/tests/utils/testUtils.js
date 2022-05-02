const server = require("../../src/http/server");
const axiosist = require("axiosist"); // eslint-disable-line node/no-unpublished-require

async function startServer() {
  const app = await server();
  const httpClient = axiosist(app);

  return {
    httpClient,
  };
}

module.exports = {
  startServer,
};
