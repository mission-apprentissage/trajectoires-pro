import path from "path";
import { isNil } from "lodash-es";
import { getDirname } from "#src/common/utils/esmUtils.js";
import ejs from "ejs";
import { ErrorWidgetNotFound, ErrorWidgetInvalidData } from "./errors.js";
import config from "#src/config.js";
import { loadBase64Font } from "#src/http/widget/templates/templates.js";

const __dirname = getDirname(import.meta.url);

const WIDGET_DEFAULT_THEME = "default";
const WIDGET_DEFAULT_TYPE = "error";
export const WIDGETS = {
  stats: {
    default: {
      currentVersion: 1,
      versions: [
        {
          version: 1,
          template: path.join(__dirname, "templates", "stats", "default.1.ejs"),
        },
      ],
      validator: (data) => {
        if (data.taux.find(({ value }) => isNil(value))) {
          return false;
        }
        return true;
      },
    },
  },
  error: {
    default: {
      currentVersion: 1,
      versions: [
        {
          version: 1,
          template: path.join(__dirname, "templates", "error", "error.1.ejs"),
        },
      ],
      validator: () => true,
    },
  },
};

function getVersion(widget, version = null) {
  const template = widget.versions.find(({ version: v }) => v === (version || widget.currentVersion));
  if (!template) {
    throw new ErrorWidgetNotFound();
  }
  return template;
}

function getBaseData(template) {
  const base64Font = loadBase64Font();

  return {
    plausibleDomain: config.widget.plausibleDomain,
    base64Font,
    version: template.version,
  };
}

export function getWidget(name, theme, { version = null }) {
  const widgetName = name || WIDGET_DEFAULT_TYPE;
  const widget = WIDGETS[widgetName];
  if (!widget) {
    throw new ErrorWidgetNotFound();
  }

  const widgetTheme = theme || WIDGET_DEFAULT_THEME;
  const widgetVariant = widget[theme];
  if (!widgetVariant) {
    throw new ErrorWidgetNotFound();
  }

  const template = getVersion(widgetVariant, version);

  return { widget: widgetVariant, template, widgetName, widgetTheme };
}

export async function renderWidget(widget, template, data) {
  if (!widget.validator(data)) {
    throw new ErrorWidgetInvalidData();
  }

  return ejs.renderFile(template.template, { ...getBaseData(template), data }, { async: true });
}
