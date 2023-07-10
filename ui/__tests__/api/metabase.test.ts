import { faker } from "@faker-js/faker";
import { iframe } from "#/app/api/metabase";
import jwt from "jsonwebtoken";

describe("Metabase", () => {
  describe("iframe", () => {
    it("returns an url", async () => {
      const id = faker.number.int();
      const params = {
        params: faker.string.alphanumeric(10),
      };
      const queryParams = {
        queryParams: faker.string.alphanumeric(10),
        queryParamsArray: [faker.string.alphanumeric(10), faker.string.alphanumeric(10)],
      };
      const hideParams = [faker.string.alphanumeric(10), faker.string.alphanumeric(10)];

      const url = await iframe(id, params, queryParams, hideParams, { bordered: true, title: true });
      const tokenMatch = url.match(new RegExp("/embed/dashboard/([^\\?]+)\\?"));
      expect(tokenMatch).not.toEqual(null);
      expect(tokenMatch.length).toEqual(2);

      const tokenDecode = jwt.decode(tokenMatch[1]);
      expect(tokenDecode?.params?.params).toEqual(params.params);
      expect(tokenDecode?.resource?.dashboard).toEqual(id);

      expect(url).toEqual(expect.stringContaining(`queryParams=${queryParams.queryParams}`));
      expect(url).toEqual(expect.stringContaining(`queryParamsArray=${queryParams.queryParamsArray[0]}`));
      expect(url).toEqual(expect.stringContaining(`queryParamsArray=${queryParams.queryParamsArray[1]}`));
      expect(url).toEqual(expect.stringContaining(`queryParamsArray=${queryParams.queryParamsArray[1]}`));
      expect(url).toEqual(expect.stringContaining(`hide_parameters=${hideParams.join(",")}`));

      expect(url).toEqual(expect.stringContaining(`bordered=true`));
      expect(url).toEqual(expect.stringContaining(`titled=true`));
    });
  });
});
