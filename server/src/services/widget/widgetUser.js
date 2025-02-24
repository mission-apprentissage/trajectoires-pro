import UglifyJs from "uglify-js";
import UserRepository from "#src/common/repositories/user.js";
import { WIDGETS, renderWidget, getWidget } from "./widget.js";
import { ErrorWidgetDoesNotExist } from "./error.js";
import { ErrorUserDoesNotExist } from "#src/services/user/error.js";
import config from "#src/config.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { formatMillesime } from "#src/http/utils/formatters.js";

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

export async function getUserWidget({
  widgets = WIDGETS,
  hash,
  name,
  theme = "default",
  data = {},
  options = {},
  plausibleCustomProperties = {},
}) {
  const user = await UserRepository.first({ "widget.hash": hash });
  if (!user) {
    throw new ErrorWidgetDoesNotExist();
  }

  const userVersion = user.widget.version.find((v) => v.type === name && v.theme === theme);
  const widget = getWidget({ widgets, name, theme, version: userVersion?.version });
  if (!userVersion) {
    await UserRepository.updateOne(
      { username: user.username },
      {
        "widget.version": [
          ...user.widget.version,
          {
            type: name,
            theme,
            version: widget.template.version,
          },
        ],
      }
    );
  }

  return await renderWidget({
    widget: widget,
    data,
    options,
    plausibleCustomProperties: {
      user: user.username,
      ...plausibleCustomProperties,
    },
  });
}

async function getUserWidgetWithError({
  code_certification,
  millesime,
  hash,
  name,
  nameError = "error",
  theme = "default",
  data = {},
  options = {},
  plausibleCustomProperties = {},
}) {
  try {
    return await getUserWidget({
      hash,
      name,
      theme,
      options,
      data,
      plausibleCustomProperties,
    });
  } catch (err) {
    return await getUserWidget({
      hash,
      name: nameError,
      theme,
      options,
      data: {
        ...data,
        error: err.name,
        millesimes: formatMillesime(millesime).split("_"),
        code_certification,
      },
    });
  }
}

export async function getUserStatsWidget({
  code_certification,
  millesime,
  hash,
  theme = "default",
  data = {},
  options = {},
  plausibleCustomProperties = {},
}) {
  if (data?.familleMetier?.isAnneeCommune) {
    let widgets = [];
    for (const certificationTerminale of data.certificationsTerminales) {
      widgets.push(
        await getUserWidgetWithError({
          code_certification: certificationTerminale.code_certification,
          millesime,
          name: "statsOnly",
          nameError: "errorStatsOnly",
          hash,
          theme,
          data: certificationTerminale,
          options,
          plausibleCustomProperties,
        })
      );
    }

    return await getUserWidgetWithError({
      code_certification,
      millesime,
      name: "statsContainer",
      nameError: "error",
      hash,
      theme,
      data: { ...data, widgets },
      options,
      plausibleCustomProperties,
    });
  }

  return getUserWidgetWithError({
    code_certification,
    millesime,
    name: "stats",
    nameError: "error",
    hash,
    theme,
    data,
    options,
    plausibleCustomProperties,
  });
}

export function getIframe({ user, parameters = {}, path }) {
  if (!user?.widget?.hash) {
    throw new ErrorUserDoesNotExist();
  }

  const searchParams = new URLSearchParams(omitNil(parameters));
  const url = `${config.publicUrl}${path}/${user.widget.hash}?${searchParams.toString()}`;
  return `<iframe onLoad="${IFRAME_ON_LOAD_JS}" style="width: 100%; height: 0;" src="${url}" scrolling="no" frameBorder="0"></iframe>`;
}
