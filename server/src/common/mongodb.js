const mongoose = require("mongoose");
const config = require("../config");
const logger = require("./logger");

mongoose.set("useCreateIndex", true);

module.exports.connectToMongodb = (mongoUri = config.mongodb.uri) => {
  return new Promise((resolve, reject) => {
    logger.debug(`MongoDB: Connection to ${mongoUri}`);

    // Set up default mongoose connection
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise; // Get the default connection
    const db = mongoose.connection;

    // Bind connection to error event (to get notification of connection errors)
    db.on("error", (e) => {
      logger.error.bind(logger, "MongoDB: connection error:");
      reject(e);
    });

    db.once("open", () => {
      logger.debug("MongoDB: Connected");
      resolve({ db });
    });
  });
};

module.exports.closeMongoConnection = (mongooseInst = mongoose) => mongooseInst.disconnect();
