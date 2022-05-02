// eslint-disable-next-line node/no-unpublished-require
let { MongoMemoryServer } = require("mongodb-memory-server");
const { connectToMongodb, getDatabase, configureValidation, configureIndexes } = require("../../src/common/mongodb");

let mongodHolder;

module.exports = {
  async startMongod() {
    mongodHolder = await MongoMemoryServer.create({
      binary: {
        version: "5.0.2",
      },
    });
    let uri = mongodHolder.getUri();
    let client = await connectToMongodb(uri);
    await configureIndexes();
    await configureValidation();
    return client;
  },
  stopMongod() {
    return mongodHolder.stop();
  },
  async removeAll() {
    let collections = await getDatabase().collections();
    return Promise.all(collections.map((c) => c.deleteMany({})));
  },
};
