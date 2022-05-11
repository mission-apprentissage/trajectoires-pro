const { collectionExists } = require("../utils");

module.exports = {
  async up(db) {
    if (await collectionExists(db, "inserJeunesNational")) {
      const collectionNational = db.collection("inserJeunesNational");
      await collectionNational.rename("inserJeunesNationals", { dropTarget: true });
    }

    if (await collectionExists(db, "insertJeunes")) {
      const collectionEtablissement = db.collection("insertJeunes");
      await collectionEtablissement.rename("inserJeunesEtablissements", { dropTarget: true });
    }
  },

  async down(db) {
    const collectionNational = db.collection("inserJeunesNationals");
    await collectionNational.rename("inserJeunesNational", { dropTarget: true });

    const collectionEtablissement = db.collection("inserJeunesEtablissements");
    await collectionEtablissement.rename("insertJeunes", { dropTarget: true });
  },
};
