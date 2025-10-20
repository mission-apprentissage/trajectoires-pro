import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { omit } from "lodash-es";
import MockDate from "mockdate";
import * as User from "#src/services/user/user.js";
import UserRepository from "#src/common/repositories/user.js";

const { assert } = chai;
chai.use(chaiAsPromised);

describe("user/user", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("createUser", () => {
    it("Vérifie que l'on peut créer un utilisateur", async () => {
      const userCreated = await User.createUser({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });
      assert.deepEqual(omit(userCreated, ["_id", "password", "widget.hash"]), {
        _meta: {
          created_on: new Date(),
          updated_on: new Date(),
        },
        username: "test",
        widget: {
          version: [],
        },
      });
      assert.isString(userCreated.password);
      assert.isString(userCreated.widget.hash);

      const userDb = await UserRepository.first({ username: "test" });
      assert.deepEqual(omit(userDb, ["_id", "password", "widget.hash"]), {
        _meta: {
          created_on: new Date(),
          updated_on: new Date(),
        },
        username: "test",
        widget: {
          version: [],
        },
      });
      assert.equal(userCreated.password, userDb.password);
      assert.equal(userCreated.widget.hash, userDb.widget.hash);
    });

    it("Retourne une erreur lorsque l'utilisateur existe déjà", async () => {
      await User.createUser({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });

      await assert.isRejected(
        User.createUser({
          username: "test",
          password: "Password1234!",
          passwordRepeat: "Password4567!",
        }),
        Error,
        "User test already exist"
      );
    });

    it("Retourne une erreur lorsque les mot de passes ne sont pas les mêmes", async () => {
      await assert.isRejected(
        User.createUser({
          username: "test",
          password: "Password1234!",
          passwordRepeat: "Password4567!",
        }),
        Error,
        "Your passwords does not match"
      );
    });

    it("Retourne une erreur lorsque le mot de passe n'est pas valide", async () => {
      await assert.isRejected(
        User.createUser({
          username: "test",
          password: "test",
          passwordRepeat: "test",
        }),
        Error,
        "Your password must contain at least one digit, one lowercase letter, one uppercase letter, one special character and it must be 8-50 characters long"
      );
    });
  });

  describe("removeUser", () => {
    it("Vérifie que l'on peut supprimer un utilisateur", async () => {
      await User.createUser({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });
      const userDb = await UserRepository.first({ username: "test" });
      assert.notEqual(userDb, null);
      await User.removeUser({ username: "test" });
      assert.equal(await UserRepository.first({ username: "test" }), null);
    });

    it("Retourne une erreur lorsque l'utilisateur n'existe pas", async () => {
      await assert.isRejected(User.removeUser({ username: "test" }), Error, "User test does not exist");
    });
  });
});
