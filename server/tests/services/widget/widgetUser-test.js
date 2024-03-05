import { faker } from "@faker-js/faker";
import chai, { expect } from "chai";
import chaiFiles from "chai-files";
import chaiAsPromised from "chai-as-promised";
import chaiDom from "chai-dom";
import { JSDOM } from "jsdom";
import path from "path";
import { cloneDeep } from "lodash-es";
import { getDirname } from "#src/common/utils/esmUtils.js";
import { insertUser } from "#tests/utils/fakeData.js";
import { WIDGET_DEFAULT_THEME, WIDGETS } from "#src/services/widget/widget.js";
import { getUserWidget, getIframe } from "#src/services/widget/widgetUser.js";
import * as Error from "#src/services/widget/error.js";
import UserRepository from "#src/common/repositories/user.js";

const __dirname = getDirname(import.meta.url);

chai.use(chaiFiles);
chai.use(chaiAsPromised);
chai.use(chaiDom);
const { assert } = chai;

describe("widgetUser", () => {
  describe("getIframe", () => {
    it("Retourne une iframe avec un lien correspondant à un utilisateur", async () => {
      const user = {
        widget: {
          hash: faker.string.alphanumeric(10),
        },
      };
      const iframeHtml = getIframe({ parameters: { param1: "1", param2: "2" }, user, path: "/test" });
      const iframe = new JSDOM(iframeHtml);
      const iframeElt = iframe.window.document.querySelector("iframe");
      expect(iframeElt).to.exist;
      expect(iframeElt).to.have.attribute("onLoad");
      expect(iframeElt).to.have.attribute("src", `http://localhost/test/${user.widget.hash}?param1=1&param2=2`);
    });
  });

  describe("getUserWidget", () => {
    it("Throw une erreur lorsque le hash ne correspond à aucun utilisateur", async () => {
      await assert.isRejected(getUserWidget({ hash: "unknow" }), Error.ErrorWidgetDoesNotExist);
    });

    it("Retourne la current version d'un widget si l'utilisateur n'a pas de version", async () => {
      await insertUser();
      const widget = await getUserWidget({
        hash: "test",
        name: "stats",
        data: {
          taux: [
            { name: "formation", value: 10 },
            { name: "emploi", value: 10 },
            { name: "autres", value: 10 },
          ],
          millesimes: ["2020", "2021"],
          description: { titre: "titre", details: "description" },
        },
      });
      assert.isString(widget);

      const user = await UserRepository.first({});
      assert.deepEqual(user.widget.version, [
        { theme: "default", type: "stats", version: WIDGETS["stats"].variant[WIDGET_DEFAULT_THEME].currentVersion },
      ]);
    });

    it("Retourne la version du widget de l'utilisateur", async () => {
      const widgets = cloneDeep(WIDGETS);
      const version = widgets["stats"].variant[WIDGET_DEFAULT_THEME].versions[0];
      widgets["stats"].variant.default.versions.push({
        ...version,
        template: path.join(__dirname, "../../", "fixtures", "widgets", "stats", "empty.2.ejs"),
        version: 2,
      });

      await insertUser({
        widget: {
          hash: "test",
          version: [{ theme: "default", type: "stats", version: 2 }],
        },
      });

      await insertUser({
        username: "test2",
        widget: {
          hash: "test2",
          version: [],
        },
      });

      const widget = await getUserWidget({
        widgets,
        hash: "test",
        name: "stats",
        data: {
          taux: [
            { name: "formation", value: 10 },
            { name: "emploi", value: 10 },
            { name: "autres", value: 10 },
          ],
          millesimes: ["2020", "2021"],
          description: { titre: "titre", details: "description" },
        },
      });
      assert.equal(widget, "v2");

      const widget2 = await getUserWidget({
        widgets,
        hash: "test2",
        name: "stats",
        data: {
          taux: [
            { name: "formation", value: 10 },
            { name: "emploi", value: 10 },
            { name: "autres", value: 10 },
          ],
          millesimes: ["2020", "2021"],
          description: { titre: "titre", details: "description" },
        },
      });
      assert.notEqual(widget2, "v2");

      const user = await UserRepository.first({ username: "test" });
      assert.deepEqual(user.widget.version, [{ theme: "default", type: "stats", version: 2 }]);

      const user2 = await UserRepository.first({ username: "test2" });
      assert.deepEqual(user2.widget.version, [{ theme: "default", type: "stats", version: 1 }]);
    });
  });
});
