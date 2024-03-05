import chai from "chai";
import chaiFiles from "chai-files";
import chaiAsPromised from "chai-as-promised";
import { cloneDeep } from "lodash-es";
import {
  WIDGET_DEFAULT_NAME,
  WIDGET_DEFAULT_THEME,
  WIDGETS,
  getWidget,
  renderWidget,
} from "#src/services/widget/widget.js";
import * as Error from "#src/services/widget/error.js";

chai.use(chaiFiles);
chai.use(chaiAsPromised);
const { assert } = chai;

describe("widget", () => {
  describe("WIDGETS", () => {
    it("Vérifie que chaque élément contient un validator et un format de template valide", () => {
      const keys = Object.keys(WIDGETS);
      for (const key of keys) {
        assert.isFunction(WIDGETS[key].validator);
        assert.isObject(WIDGETS[key].variant);

        const variants = Object.keys(WIDGETS[key].variant);
        assert.isObject(WIDGETS[key].variant["default"]);

        for (const variantKey of variants) {
          const variant = WIDGETS[key].variant[variantKey];
          assert.isNumber(variant.currentVersion);
          assert.exists(variant.versions.find(({ version }) => version === variant.currentVersion));
          variant.versions.forEach((version) => {
            assert.isNumber(version.version);
            assert.exists(chaiFiles.file(version.template));
          });
        }
      }
    });
  });

  describe("getWidget", async () => {
    it("Retourne le widget par défaut quand on ne passe pas de paramètre", () => {
      const widget = getWidget();
      assert.strictEqual(widget.name, WIDGET_DEFAULT_NAME);
      assert.strictEqual(widget.theme, WIDGET_DEFAULT_THEME);
      assert.isNumber(widget.template.version);
      assert.exists(chaiFiles.file(widget.template.template));
    });

    it("Retourne un widget quand on passe un nom et un theme", () => {
      const widgets = cloneDeep(WIDGETS);
      widgets["stats"].variant["test"] = widgets["stats"].variant["default"];

      const widget = getWidget({ widgets, name: "stats", theme: "test" });
      assert.strictEqual(widget.name, "stats");
      assert.strictEqual(widget.theme, "test");
      assert.isNumber(widget.template.version);
      assert.exists(chaiFiles.file(widget.template.template));
    });

    it("Retourne la currentVersion d'un widget", () => {
      const widgets = cloneDeep(WIDGETS);
      const version = widgets[WIDGET_DEFAULT_NAME].variant[WIDGET_DEFAULT_THEME].versions[0];
      widgets[WIDGET_DEFAULT_NAME].variant.default.currentVersion = 2;
      widgets[WIDGET_DEFAULT_NAME].variant.default.versions.push({ ...version, version: 2 });

      const widget = getWidget({ widgets });
      assert.strictEqual(widget.name, WIDGET_DEFAULT_NAME);
      assert.strictEqual(widget.theme, WIDGET_DEFAULT_THEME);
      assert.strictEqual(widget.template.version, 2);
      assert.exists(chaiFiles.file(widget.template.template));
    });

    it("Throw une erreur quand le widget n'existe pas", () => {
      assert.throws(() => getWidget({ name: "unknow" }), Error.ErrorWidgetNotFound);
    });

    it("Throw une erreur quand le theme n'existe pas", () => {
      assert.throws(() => getWidget({ name: WIDGET_DEFAULT_NAME, theme: "unknow" }), Error.ErrorWidgetNotFound);
    });

    it("Throw une erreur quand la version n'existe pas", () => {
      assert.throws(() => getWidget({ name: WIDGET_DEFAULT_NAME, version: -1 }), Error.ErrorWidgetNotFound);
    });
  });

  describe("renderWidget", () => {
    it("Render un widget", async () => {
      const widget = getWidget();
      const rendered = await renderWidget({ widget });
      assert.isString(rendered);
    });

    it("Throw une erreur lorsque le validator retourne faux", async () => {
      const widgets = cloneDeep(WIDGETS);
      widgets[WIDGET_DEFAULT_NAME].validator = () => false;
      const widget = getWidget({ widgets });
      await assert.isRejected(renderWidget({ widget }), Error.ErrorWidgetInvalidData);
    });
  });
});
