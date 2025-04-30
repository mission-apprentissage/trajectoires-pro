export const up = async (db, client) => {
  await db.collection("cfdRomes").drop();
  await db.collection("romeMetier").drop();
  await db.collection("rome").drop();
  await db.collection("cfdMetiers").drop();
};

export const down = async (db, client) => {
  // No need to add these collections again
};
