import { MongoClient } from "mongodb";
import { merge } from "lodash-es";
import config from "../../config.js";
import { writeData } from "oleoduc";
import { logger } from "../logger.js";

let clientHolder;
function ensureInitialization() {
  if (!clientHolder) {
    throw new Error("Database connection does not exist. Please call connectToMongodb before.");
  }
}

export function sendLogsToMongodb(logger, level = "info") {
  logger.addStream({
    name: "mongodb",
    type: "raw",
    level: level,
    stream: writeData((data) => dbCollection("logs").insertOne(data)),
  });
}

export async function connectToMongodb(uri = config.mongodb.uri) {
  let client = await new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  clientHolder = client;

  if (config.log.destinations.includes("mongodb")) {
    sendLogsToMongodb(logger);
  }

  return client;
}

export function closeMongodbConnection() {
  ensureInitialization();
  return clientHolder.close();
}

export function getDatabase() {
  ensureInitialization();
  return clientHolder.db();
}

export function dbCollection(name) {
  ensureInitialization();
  return clientHolder.db().collection(name);
}

export async function createCollectionIfNeeded(name) {
  let db = getDatabase();
  let collections = await db.listCollections().toArray();

  if (!collections.find((c) => c.name === name)) {
    await db.createCollection(name).catch(() => {});
  }
}

export async function upsert(collection, query, fields, onModified = {}) {
  const res = await collection.updateOne(query, fields, { upsert: true });

  if (res.modifiedCount) {
    await collection.updateOne(
      query,
      merge(
        {
          $set: {
            "_meta.updated_on": new Date(),
          },
        },
        onModified
      )
    );
  }

  return res;
}
