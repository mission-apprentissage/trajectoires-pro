import chai from "chai";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import { isEqual } from "lodash-es";
import { getCollectionDescriptors } from "../src/common/db/collections/collections.js";
import { getDatabase } from "../src/common/db/mongodb.js";

chai.use(deepEqualInAnyOrder);
const { assert } = chai;

describe("migrations", () => {
  it("Vérifie que les migrations donnent un schema identique aux modèles", async () => {
    await Promise.all(
      getCollectionDescriptors().map(async ({ name, schema }) => {
        const collectionInfos = await getDatabase().listCollections({ name }).toArray();
        const validator = collectionInfos[0].options.validator;
        assert.exists(validator?.$jsonSchema);
        assert.deepEqualInAnyOrder(schema(), validator.$jsonSchema);
      })
    );
  });

  it("Vérifie que les migrations créent les indexes", async () => {
    await Promise.all(
      getCollectionDescriptors().map(async ({ name, indexes }) => {
        const currentIndexes = await getDatabase().collection(name).indexes();
        const indexList = indexes();

        for (const index of indexList) {
          const [key, options = {}] = index;

          const currentIndex = currentIndexes.find((i) => isEqual(i.key, key));
          assert.deepInclude(currentIndex, { key, ...options });
        }
      })
    );
  });
});
