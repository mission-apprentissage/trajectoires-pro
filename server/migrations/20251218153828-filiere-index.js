import { logger } from "#src/common/logger.js";

const indexes = [
  {
    collection: "certificationsStats",
    oldIndex: [{ millesime: 1, code_certification: 1 }, { unique: true }],
    newIndex: [{ millesime: 1, code_certification: 1, filiere: 1 }, { unique: true }],
  },
  {
    collection: "regionalesStats",
    oldIndex: [{ "region.code": 1, code_certification: 1, millesime: 1 }, { unique: true }],
    newIndex: [{ "region.code": 1, code_certification: 1, millesime: 1, filiere: 1 }, { unique: true }],
  },
  {
    collection: "formationsStats",
    oldIndex: [{ uai: 1, code_certification: 1, millesime: 1 }, { unique: true }],
    newIndex: [{ uai: 1, code_certification: 1, millesime: 1, filiere: 1 }, { unique: true }],
  },
];

export const up = async (db) => {
  await Promise.all(
    indexes.map(async ({ collection, oldIndex, newIndex }) => {
      logger.debug(`Configuring indexes for collection ${collection}...`);
      let dbCol = db.collection(collection);
      await dbCol.dropIndex(oldIndex[0]);
      return dbCol.createIndex(newIndex[0], newIndex[1]);
    })
  );
};

export const down = async (db) => {
  await Promise.all(
    indexes.map(async ({ collection, oldIndex, newIndex }) => {
      logger.debug(`Configuring indexes for collection ${collection}...`);
      let dbCol = db.collection(collection);
      await dbCol.dropIndex(newIndex[0]);
      return dbCol.createIndex(oldIndex[0], oldIndex[1]);
    })
  );
};
