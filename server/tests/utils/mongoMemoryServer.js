// eslint-disable-next-line node/no-unpublished-require
let { MongoMemoryServer } = require("mongodb-memory-server");
const { connectToMongodb } = require("../../src/common/mongodb");
const models = require("../../src/common/model");

let mongodHolder;

module.exports = {
  async startMongod() {
    mongodHolder = await MongoMemoryServer.create({
      binary: {
        version: "5.0.2",
      },
    });
    let uri = mongodHolder.getUri();
    return connectToMongodb(uri);
  },
  stopMongod() {
    return mongodHolder.stop();
  },
  async removeAll() {
    return Promise.all(Object.values(models).map((m) => m.deleteMany()));
  },
};
