import { MongoClient } from "mongodb";
import { merge, mergeWith, isArray, uniq, omit, without } from "lodash-es";
import config from "#src/config.js";
import { writeData } from "oleoduc";
import { logger } from "#src/common/logger.js";

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

export function setMongoDBClient(client) {
  clientHolder = client;
  return client;
}

export async function connectToMongodb(uri = config.mongodb.uri) {
  let client = await new MongoClient(uri);

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

export async function updateOne(collection, query, fields, onModified = {}, options = { upsert: false }) {
  const res = await collection.updateOne(query, fields, { upsert: options.upsert });

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

export async function upsert(collection, query, fields, onModified = {}) {
  const res = await updateOne(collection, query, fields, onModified, { upsert: true });
  return res;
}

export async function mergeSchema(collectionName, newSchema) {
  const db = getDatabase();
  const collectionInfos = await db.listCollections({ name: collectionName }).toArray();
  const validator = collectionInfos[0].options.validator;

  const oldSchema = validator?.$jsonSchema || {};

  const mergeCustomizer = (objValue, srcValue) => {
    if (isArray(objValue)) {
      return uniq(objValue.concat(srcValue));
    }
  };

  return await db.command({
    collMod: collectionName,
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: mergeWith(oldSchema, newSchema, mergeCustomizer),
    },
  });
}

export async function removeFromSchema(collectionName, schemaToRemove) {
  const db = getDatabase();
  const collectionInfos = await db.listCollections({ name: collectionName }).toArray();
  const validator = collectionInfos[0].options.validator;

  if (!validator) {
    return;
  }

  const oldSchema = validator.$jsonSchema;
  const newSchema = {
    ...oldSchema,
    properties: omit(oldSchema.properties, Object.keys(schemaToRemove.properties)),
    required: without(oldSchema.required || [], ...(schemaToRemove.required || [])),
  };

  return db.command({
    collMod: collectionName,
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: newSchema,
    },
  });
}
