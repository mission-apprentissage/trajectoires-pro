import "dotenv/config";
import config from "./src/config.js";

const configMigrateMongo = {
  mongodb: {
    url: config.mongodb.uri,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true, // removes a deprecating warning when connecting
    },
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
