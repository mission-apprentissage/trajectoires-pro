import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import jwt from "jsonwebtoken";
import MockDate from "mockdate";
import * as Auth from "#src/services/auth/index.js";
import * as User from "#src/services/user/user.js";
import config from "#src/config.js";

const { assert } = chai;
chai.use(chaiAsPromised);

describe("auth/auth", () => {
  before(() => {
    MockDate.set("2023-01-01");
  });

  after(() => {
    MockDate.reset();
  });

  describe("hashPassword", () => {
    it("Retourne un mot de passe hashé", () => {
      const hash = Auth.hashPassword("test");
      assert.notEqual("test", hash);
      assert.isString(hash);
    });
  });
  describe("verifyPassword", () => {
    it("Retourne true quand le mot de passe correspond au hash", async () => {
      const hash = Auth.hashPassword("test");
      const match = Auth.verifyPassword("test", hash);
      assert.equal(match, true);
    });

    it("Retourne false quand le mot de passe ne correspond pas au hash", async () => {
      const hash = Auth.hashPassword("test");
      const match = Auth.verifyPassword("erreur", hash);
      assert.equal(match, false);
    });
  });

  describe("login", () => {
    it("Retourne un token lorsque l'utilisateur et le mot de passe sont valide", async () => {
      await User.createUser({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });
      const token = await Auth.login({ username: "test", password: "Password1234!" });
      assert.isString(token);
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      assert.equal(decoded.username, "test");
    });

    it("Retourne une erreur lorsque l'utilisateur n'existe pas", async () => {
      await assert.isRejected(
        Auth.login({ username: "test", password: "test" }),
        Error,
        "Your password or username is invalid"
      );
    });

    it("Retourne une erreur lorsque le mot ne passe n'est pas valide", async () => {
      await User.createUser({
        username: "test",
        password: "Password1234!",
        passwordRepeat: "Password1234!",
      });
      await assert.isRejected(
        Auth.login({ username: "test", password: "test" }),
        Error,
        "Your password or username is invalid"
      );
    });
  });

  describe("hasPermission", () => {
    describe("role private", () => {
      it("Retourne true si il y a un utilisateur", () => {
        const user = {};
        assert.equal(Auth.hasPermission("private", user), true);
      });

      it("Retourne false si il n'y a pas d'utilisateur", () => {
        const user = null;
        assert.equal(Auth.hasPermission("private", user), false);
      });
    });

    describe("role public", () => {
      it("Retourne true si il y a un utilisateur", () => {
        const user = {};
        assert.equal(Auth.hasPermission("public", user), true);
      });

      it("Retourne true si il n'y a pas d'utilisateur", () => {
        const user = null;
        assert.equal(Auth.hasPermission("public", user), true);
      });
    });
  });
});
