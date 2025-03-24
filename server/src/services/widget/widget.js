import path from "path";
import Joi from "joi";
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
    options: {
      noTitle: Joi.boolean().default(false),
      responsiveWidth: Joi.string()
        .regex(/^[0-9]+(em|px)/)
        .default("40em"),
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
  statsOnly: {
    variant: {
      default: {
        currentVersion: 1,
        versions: [
          {
            version: 1,
            template: path.join(__dirname, "templates", "stats", "statsOnly.1.ejs"),
          },
        ],
      },
    },
    options: {
      noTitle: Joi.boolean().default(false),
      responsiveWidth: Joi.string()
        .regex(/^[0-9]+(em|px)/)
        .default("40em"),
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
  statsContainer: {
    variant: {
      default: {
        currentVersion: 1,
        versions: [
          {
            version: 1,
            template: path.join(__dirname, "templates", "stats", "statsContainer.1.ejs"),
          },
        ],
      },
    },
    options: {
      noTitle: Joi.boolean().default(false),
      responsiveWidth: Joi.string()
        .regex(/^[0-9]+(em|px)/)
        .default("40em"),
    },
    validator: (data) => {
      if (data.widgets) {
        return true;
      }

      return false;
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
    options: {
      noTitle: Joi.boolean().default(false),
    },
    validator: () => true,
  },
  errorStatsOnly: {
    variant: {
      default: {
        currentVersion: 1,
        versions: [
          {
            version: 1,
            template: path.join(__dirname, "templates", "error", "errorStatsOnly.1.ejs"),
          },
        ],
      },
    },
    options: {
      noTitle: Joi.boolean().default(false),
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

function getBaseData({ widget, plausibleCustomProperties = {}, options = {} }) {
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
    options,
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

export async function renderWidget({ widget, data = {}, options = {}, plausibleCustomProperties = {} }) {
  if (!widget.widget.validator(data)) {
    throw new ErrorWidgetInvalidData();
  }

  return ejs.renderFile(
    widget.template.template,
    { ...getBaseData({ widget, plausibleCustomProperties, options }), data },
    { async: true }
  );
}
