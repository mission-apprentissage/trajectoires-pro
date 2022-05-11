const { collectionExists } = require("../utils");
module.exports = {
  async up(db) {
    if (await collectionExists(db, "inserJeunesEtablissements")) {
      await db.collection("inserJeunesEtablissements").drop();
    }
    if (await collectionExists(db, "etablissementsStats")) {
      await db.collection("etablissementsStats").drop();
    }
  },

  async down() {},
};
