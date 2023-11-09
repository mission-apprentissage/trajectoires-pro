import chai from "chai";
import chaiDiff from "chai-diff";
import deepEqualInAnyOrder from "deep-equal-in-any-order";
import MockDate from "mockdate";
import jwt from "jsonwebtoken";
import config from "#src/config.js";
import { startServer } from "#tests/utils/testUtils.js";
import { insertUser } from "#tests/utils/fakeData.js";

chai.use(deepEqualInAnyOrder);
chai.use(chaiDiff);
const { assert } = chai;

describe("authRoutes", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("login", () => {
    it("Vérifie qu'on obtient un jwt valide (json)", async () => {
      const { httpClient } = await startServer();

      await insertUser();
      const response = await httpClient.post(
        `/api/inserjeunes/auth/login`,
        {
          username: "test",
          password: "Password1234!",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      assert.strictEqual(response.status, 200);

      const token = response.data.token;
      assert.isString(token);
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      assert(decoded.username, "test");

      const responseRouteAuth = await httpClient.get(`/api/inserjeunes/certifications`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      assert.strictEqual(responseRouteAuth.status, 200);
    });

    it("Vérifie qu'on obtient un jwt (body)", async () => {
      const { httpClient } = await startServer();

      await insertUser();
      const response = await httpClient.post(`/api/inserjeunes/auth/login`, "username=test&password=Password1234!", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      assert.strictEqual(response.status, 200);

      const token = response.data.token;
      assert.isString(token);
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      assert(decoded.username, "test");

      const responseRouteAuth = await httpClient.get(`/api/inserjeunes/certifications`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      assert.strictEqual(responseRouteAuth.status, 200);
    });

    it("Vérifie qu'on retourne une 401 si l'utilisateur n'existe pas", async () => {
      const { httpClient } = await startServer();

      const response = await httpClient.post(
        `/api/inserjeunes/auth/login`,
        {
          username: "test",
          password: "Password1234!",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      assert.strictEqual(response.status, 401);
    });

    it("Vérifie qu'on retourne une 401 si le mot de passe n'est pas valide", async () => {
      const { httpClient } = await startServer();
      await insertUser();
      const response = await httpClient.post(
        `/api/inserjeunes/auth/login`,
        {
          username: "test",
          password: "error",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      assert.strictEqual(response.status, 401);
    });
  });
});
