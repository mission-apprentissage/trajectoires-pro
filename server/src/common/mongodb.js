const { MongoClient } = require("mongodb");
const config = require("../config");
const collections = require("./collections/schemas");
const logger = require("./logger").child({ context: "db" });
const { writeData } = require("oleoduc");

let clientHolder;

function ensureInitialization() {
  if (!clientHolder) {
    throw new Error("Database connection does not exist. Please call connectToMongodb before.");
  }
}

async function connectToMongodb(uri = config.mongodb.uri) {
  let client = await new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  clientHolder = client;

  if (config.log.destinations.includes("mongodb")) {
    sendLogsToMongodb();
  }

  return client;
}

function sendLogsToMongodb() {
  logger.addStream({
    name: "mongodb",
    type: "raw",
    level: "info",
    stream: writeData((data) => dbCollection("logs").insertOne(data)),
  });
}

function closeMongodbConnection() {
  ensureInitialization();
  return clientHolder.close();
}

function getDatabase() {
  ensureInitialization();
  return clientHolder.db();
}

function dbCollection(name) {
  ensureInitialization();
  return clientHolder.db().collection(name);
}

async function createCollectionIfNeeded(collection) {
  let db = getDatabase();
  let collections = await db.listCollections().toArray();

  if (!collections.find((c) => c.name === collection.name)) {
    await db.createCollection(collection.name).catch(() => {});
  }
}

function clearCollection(name) {
  logger.warn(`Suppression des données de la collection ${name}...`);
  return dbCollection(name)
    .deleteMany({})
    .then((res) => res.deletedCount);
}

async function configureIndexes(options = {}) {
  await ensureInitialization();
  await Promise.all(
    Object.values(collections).map(async (collection) => {
      let shouldDropIndexes = options.dropIndexes || false;
      let dbCol = dbCollection(collection.name);

      logger.debug(`Configuring indexes for collection ${collection.name} (drop:${shouldDropIndexes})...`);
      if (shouldDropIndexes) {
        await dbCol.dropIndexes({ background: false });
      }

      if (!collection.indexes) {
        return;
      }

      let indexes = collection.indexes();
      await Promise.all(
        indexes.map(([index, options]) => {
          return dbCol.createIndex(index, options);
        })
      );
    })
  );
}

async function configureValidation() {
  await ensureInitialization();
  await Promise.all(
    Object.values(collections).map(async (collection) => {
      await createCollectionIfNeeded(collection);

      if (!collection.schema) {
        return;
      }

      logger.debug(`Configuring validation for collection ${collection.name}...`);
      let db = getDatabase();
      await db.command({
        collMod: collection.name,
        validationLevel: "strict",
        validationAction: "error",
        validator: {
          $jsonSchema: collection.schema(),
        },
      });
    })
  );
}

module.exports = {
  connectToMongodb,
  configureIndexes,
  configureValidation,
  getDatabase,
  dbCollection,
  closeMongodbConnection,
  clearCollection,
};
