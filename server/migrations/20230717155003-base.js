import { logger } from "#src/common/logger.js";
import { getCollectionDescriptors } from "./20230717155003-base/collections.js";

export const up = async (db) => {
  //Create collections only if needed
  await Promise.all(
    getCollectionDescriptors().map(async ({ name }) => {
      let collections = await db.listCollections().toArray();

      if (!collections.find((c) => c.name === name)) {
        await db.createCollection(name);
      }
    })
  );

  //Create indexes
  await Promise.all(
    getCollectionDescriptors().map(async ({ name, indexes }) => {
      logger.debug(`Configuring indexes for collection ${name}...`);
      let dbCol = db.collection(name);

      if (!indexes) {
        return;
      }

      await Promise.all(
        indexes().map(([index, options]) => {
          return dbCol.createIndex(index, options);
        })
      );
    })
  );

  //Create validations
  await Promise.all(
    getCollectionDescriptors().map(async ({ name, schema }) => {
      if (!schema) {
        return;
      }

      logger.debug(`Configuring validation for collection ${name}...`);
      await db.command({
        collMod: name,
        validationLevel: "strict",
        validationAction: "error",
        validator: {
          $jsonSchema: schema(),
        },
      });
    })
  );
};

export const down = async (db) => {
  // We do not remove the collections to avoid deleting data by error

  // Drop indexes
  await Promise.all(
    getCollectionDescriptors().map(async ({ name }) => {
      logger.debug(`Remove indexes for collection ${name}...`);
      let dbCol = db.collection(name);
      await dbCol.dropIndexes({ background: false });
    })
  );

  // Remove validations
  await Promise.all(
    getCollectionDescriptors().map(async ({ name, schema }) => {
      if (!schema) {
        return;
      }

      logger.debug(`Configuring validation for collection ${name}...`);
      await db.command({
        collMod: name,
        validator: {},
        validationLevel: "off",
      });
    })
  );
};
