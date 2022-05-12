const { collectionExists } = require("../utils");

const collectionName = "inserJeunesNationals";

module.exports = {
  async up(db) {
    if (await collectionExists(db, collectionName)) {
      await db.collection(collectionName).updateMany(
        {},
        {
          $set: { millesime: "2019_2020" },
        }
      );
    }
  },

  async down(db) {
    if (await collectionExists(db, collectionName)) {
      await db.collection(collectionName).updateMany(
        {},
        {
          $set: { millesime: "2020-2019" },
        }
      );
    }
  },
};
