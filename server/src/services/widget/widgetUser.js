import UglifyJs from "uglify-js";
import UserRepository from "#src/common/repositories/user.js";
import { renderWidget, getWidget } from "./widget.js";
import { ErrorWidgetDoesNotExist } from "./errors.js";
import config from "#src/config.js";
import { omitNil } from "#src/common/utils/objectUtils.js";

const IFRAME_ON_LOAD_JS = UglifyJs.minify(
  `(function load(f) {
  window.addEventListener('message', function(e) {
  if (e.origin !== '${config.publicUrl}' || isNaN(e.data)) return;
  f.style.height = e.data + 'px';
  }, false);
  })(this)`.replaceAll("\n", ""),
  {
    output: {
      beautify: false,
      quote_style: 1,
    },
  }
).code;

export async function getUserWidget({ hash, type, theme = "default", data = {}, plausibleCustomProperties = {} }) {
  const user = await UserRepository.first({ "widget.hash": hash });
  if (!user) {
    throw new ErrorWidgetDoesNotExist();
  }

  const userVersion = user.widget.version.find((v) => v.type === type && v.theme === theme);
  const widget = getWidget(type, theme, { version: userVersion?.version });
  if (!userVersion) {
    await UserRepository.updateOne(
      { username: user.username },
      {
        "widget.version": [
          ...user.widget.version,
          {
            type,
            theme,
            version: widget.template.version,
          },
        ],
      }
    );
  }

  return renderWidget({
    widget: widget,
    data,
    plausibleCustomProperties: {
      user: user.username,
      ...plausibleCustomProperties,
    },
  });
}

export async function getIframe({ user, parameters, path }) {
  const searchParams = new URLSearchParams(omitNil(parameters));
  const url = `${config.publicUrl}${path}/${user.widget.hash}?${searchParams.toString()}`;
  return `<iframe onLoad="${IFRAME_ON_LOAD_JS}" style="width: 100%; height: 0;" src="${url}" scrolling="no" frameBorder="0"></iframe>`;
}
