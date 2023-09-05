import assert from "assert";
import { DataGouvApi } from "#src/services/dataGouv/DataGouvApi.js";
import { mockDataGouv } from "#tests/utils/apiMocks.js";
import streamToArray from "stream-to-array";

describe("DataGouvApi", () => {
  describe("dataset", () => {
    it("Retourne un dataset", async () => {
      mockDataGouv((client) => {
        client
          .get("/datasets/r/id_test")
          .query(() => true)
          .reply(200, "data");
      });
      const dataGouvApi = new DataGouvApi();
      const stream = await dataGouvApi.datasets("id_test");
      const result = await streamToArray(stream);
      assert.equal(result.toString(), "data");
    });
  });
});
