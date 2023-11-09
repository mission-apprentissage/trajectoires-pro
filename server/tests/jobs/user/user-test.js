import chai from "chai";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import * as JobUser from "#src/jobs/user/user.js";
import UserRepository from "#src/common/repositories/user.js";

const { assert } = chai;

describe("user", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("create", () => {
    it("Vérifie que l'on peut créer un utilisateur", async () => {
      const userCreated = await JobUser.create({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });
      assert.deepEqual(omit(userCreated, ["_id", "password"]), {
        _meta: {
          created_on: new Date(),
          updated_on: new Date(),
        },
        username: "test",
      });
      assert.isString(userCreated.password);

      const userDb = await UserRepository.first({ username: "test" });
      assert.deepEqual(omit(userDb, ["_id", "password"]), {
        _meta: {
          created_on: new Date(),
          updated_on: new Date(),
        },
        username: "test",
      });
      assert.equal(userCreated.password, userDb.password);
    });
  });

  describe("remove", () => {
    it("Vérifie que l'on peut supprimer un utilisateur", async () => {
      await JobUser.create({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });

      await JobUser.remove({
        username: "test",
      });
      assert.equal(await UserRepository.first({ username: "test" }), null);
    });
  });
});
