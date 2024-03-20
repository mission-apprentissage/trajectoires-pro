import path from "path";
import { isNil } from "lodash-es";
import { getDirname } from "#src/common/utils/esmUtils.js";
import ejs from "ejs";
import { ErrorWidgetNotFound, ErrorWidgetInvalidData } from "./error.js";
import config from "#src/config.js";
import { loadBase64Font } from "#src/http/widget/templates/templates.js";

const __dirname = getDirname(import.meta.url);

export const WIDGET_DEFAULT_THEME = "default";
export const WIDGET_DEFAULT_NAME = "error";
export const WIDGETS = {
  stats: {
    variant: {
      default: {
        currentVersion: 1,
        versions: [
          {
            version: 1,
            template: path.join(__dirname, "templates", "stats", "default.1.ejs"),
          },
        ],
      },
    },
    validator: (data) => {
      const isInvalid = (taux) => !taux || !!taux.find(({ value }) => isNil(value));

      if (data.type === "filieres") {
        if (isInvalid(data?.pro?.taux) && isInvalid(data?.apprentissage?.taux)) {
          return false;
        }
        return true;
      }

      if (isInvalid(data?.taux)) {
        return false;
      }
      return true;
    },
  },
  error: {
    variant: {
      default: {
        currentVersion: 1,
        versions: [
          {
            version: 1,
            template: path.join(__dirname, "templates", "error", "error.1.ejs"),
          },
        ],
      },
    },
    validator: () => true,
  },
};

function getVersion(widget, version = null) {
  const template = widget.versions.find(({ version: v }) => v === (version || widget.currentVersion));
  if (!template) {
    throw new ErrorWidgetNotFound();
  }
  return template;
}

function getBaseData({ widget, plausibleCustomProperties = {} }) {
  const base64Font = loadBase64Font();

  return {
    plausibleDomain: config.widget.plausibleDomain,
    plausibleCustomProperties: {
      name: widget.name,
      theme: widget.theme,
      version: widget.template.version,
      ...plausibleCustomProperties,
    },
    base64Font,
    version: widget.template.version,
  };
}

export function getWidget({ widgets = WIDGETS, name = null, theme = null, version = null } = {}) {
  const widgetName = name || WIDGET_DEFAULT_NAME;
  const widget = widgets[widgetName];
  if (!widget) {
    throw new ErrorWidgetNotFound();
  }

  const widgetTheme = theme || WIDGET_DEFAULT_THEME;
  const widgetVariant = widget.variant[widgetTheme];
  if (!widgetVariant) {
    throw new ErrorWidgetNotFound();
  }

  const template = getVersion(widgetVariant, version);

  return { widget, template, theme: widgetTheme, name: widgetName };
}

export async function renderWidget({ widget, data = {}, plausibleCustomProperties = {} }) {
  if (!widget.widget.validator(data)) {
    throw new ErrorWidgetInvalidData();
  }

  return ejs.renderFile(
    widget.template.template,
    { ...getBaseData({ widget, plausibleCustomProperties }), data },
    { async: true }
  );
}
