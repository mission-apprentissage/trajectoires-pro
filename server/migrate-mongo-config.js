import "dotenv/config";
import config from "./src/config.js";

const configMigrateMongo = {
  mongodb: {
    url: config.mongodb.uri,
  },
  migrationsDir: "migrations",

  changelogCollectionName: "changelog",

  migrationFileExtension: ".js",

  // Enable the algorithm to create a checksum of the file contents and use that in the comparison to determin
  // if the file should be run.  Requires that scripts are coded to be run multiple times.
  useFileHash: false,

  moduleSystem: "esm",
};

export default configMigrateMongo;
