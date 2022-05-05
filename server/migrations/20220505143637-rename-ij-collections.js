module.exports = {
  async up(db) {
    const collectionNational = db.collection("inserJeunesNational");
    await collectionNational.rename("inserJeunesNationals", { dropTarget: true });

    const collectionEtablissement = db.collection("insertJeunes");
    await collectionEtablissement.rename("inserJeunesEtablissements", { dropTarget: true });
  },

  async down(db) {
    const collectionNational = db.collection("inserJeunesNationals");
    await collectionNational.rename("inserJeunesNational", { dropTarget: true });

    const collectionEtablissement = db.collection("inserJeunesEtablissements");
    await collectionEtablissement.rename("insertJeunes", { dropTarget: true });
  },
};
