const { stopMongod, removeAll, startMongod } = require("./mongoMemoryServer");
const nock = require("nock"); // eslint-disable-line node/no-unpublished-require

nock.disableNetConnect();
nock.enableNetConnect((host) => {
  return host.startsWith("127.0.0.1") || host.indexOf("fastdl.mongodb.org") !== -1;
});

exports.mochaGlobalSetup = function () {
  return startMongod();
};

exports.mochaHooks = {
  afterEach: async function () {
    nock.cleanAll();
    return removeAll();
  },
};

exports.mochaGlobalTeardown = function () {
  return stopMongod();
};
