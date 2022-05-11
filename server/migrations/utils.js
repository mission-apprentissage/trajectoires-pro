async function getCollectionNames(db) {
  return (await db.listCollections().toArray()).map((c) => c.name);
}

async function collectionExists(db, name) {
  let names = await getCollectionNames(db);
  return names.includes(name);
}

module.exports = {
  getCollectionNames,
  collectionExists,
};
