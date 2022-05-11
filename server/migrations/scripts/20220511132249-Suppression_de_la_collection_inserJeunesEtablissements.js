const { collectionExists } = require("../utils");
module.exports = {
  async up(db) {
    if (await collectionExists(db, "inserJeunesEtablissements")) {
      await db.collection("inserJeunesEtablissements").dropCollection();
    }
  },

  async down() {},
};
