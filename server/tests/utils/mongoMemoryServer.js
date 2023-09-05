import { MongoMemoryServer } from "mongodb-memory-server"; // eslint-disable-line node/no-unpublished-import
import { connectToMongodb, getDatabase } from "#src/common/db/mongodb.js";
import * as MigrateMongo from "migrate-mongo";

let mongodHolder;
let migrateMongoHolder;

export async function startMongod() {
  mongodHolder = await MongoMemoryServer.create({
    instance: {
      dbName: "test",
    },
    binary: {
      version: "5.0.6",
    },
  });
  let uri = mongodHolder.getUri();
  let client = await connectToMongodb(uri);
  await runMigration(uri);

  return client;
}

async function runMigration(uri) {
  const config = {
    mongodb: {
      url: uri,
      options: { useNewUrlParser: true },
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".js",
  };
  MigrateMongo.config.set(config);

  migrateMongoHolder = await MigrateMongo.database.connect();
  await MigrateMongo.up(migrateMongoHolder.db, migrateMongoHolder.client);
}

export async function stopMongod() {
  await MigrateMongo.down(migrateMongoHolder.db, migrateMongoHolder.client);
  return mongodHolder.stop();
}

export async function removeAll() {
  let collections = await getDatabase().collections();
  return Promise.all(
    collections.map(async (c) => {
      await c.deleteMany({});
    })
  );
}
