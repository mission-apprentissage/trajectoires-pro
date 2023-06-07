import { DateTime } from "luxon";
import { buildWidget, isWidgetAvailable, prepareStatsForWidget } from "../widget/widget.js";
import { buildDescription, buildDescriptionFiliere } from "../../common/stats.js";
import { isEmpty } from "lodash-es";
import { findRegionByCode } from "../../common/regions.js";
import {
  ErrorRegionaleNotFound,
  ErrorNoDataForMillesime,
  ErrorFormationNotFound,
  ErrorCertificationNotFound,
  ErrorNoDataAvailable,
  ErrorCertificationsNotFound,
} from "../errors.js";

export function addJsonHeaders(res) {
  res.setHeader("Content-Type", `application/json`);
}

export function addCsvHeaders(res, options = {}) {
  let fullname = `${options.filename || "export"}-${DateTime.now().toISODate()}.csv`;
  res.setHeader("Content-disposition", `attachment; filename=${fullname}`);
  res.setHeader("Content-Type", `text/csv; charset=UTF-8`);
}

export function sendSvg(res, content) {
  res.setHeader("content-type", "image/svg+xml");
  return res.status(200).send(content);
}

export async function sendErrorSvgEmpty(res, options = {}) {
  return sendSvg(res, await buildWidget("errorEmpty", {}, options));
}

export async function sendErrorSvg(res, data = {}, options = {}) {
  return sendSvg(res, await buildWidget("error", data, options));
}

export async function sendStats(type, stats, res, options = {}) {
  const { ext, theme, direction } = options;
  const description = buildDescription(stats);
  const metadata = { ...stats._meta, ...description };

  if (ext !== "svg") {
    return res.json({ ...stats, _meta: metadata });
  } else {
    if (!isWidgetAvailable(stats)) {
      throw new ErrorNoDataAvailable();
    }

    const widget = await buildWidget(
      type,
      {
        stats: prepareStatsForWidget(stats),
        description,
        millesime: stats.millesime,
        region: stats.region,
      },
      { theme, direction }
    );

    return sendSvg(res, widget);
  }
}

export async function sendFilieresStats(filieresStats, res, options = {}) {
  const { ext } = options;

  if (isEmpty(filieresStats)) {
    throw new ErrorCertificationsNotFound();
  }

  if (ext !== "svg") {
    return res.json(filieresStats);
  } else {
    const { pro, apprentissage } = filieresStats;
    if (!isWidgetAvailable(pro) && !isWidgetAvailable(apprentissage)) {
      throw new ErrorNoDataAvailable();
    }

    const { direction, theme } = options;
    const validFiliere = pro || apprentissage;
    const description = pro && apprentissage ? buildDescriptionFiliere(filieresStats) : buildDescription(validFiliere);

    const widget = await buildWidget(
      "cfd",
      {
        stats: {
          pro: pro && prepareStatsForWidget(pro),
          apprentissage: apprentissage && prepareStatsForWidget(apprentissage),
        },
        exist: {
          pro: !!pro,
          apprentissage: !!apprentissage,
        },
        description,
        millesime: validFiliere.millesime,
        region: validFiliere.region,
      },
      { theme, direction }
    );

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(widget);
  }
}

export async function sendImageOnError(cb, res, data = {}, options = { imageOnError: "true" }) {
  const { imageOnError = "true", ext } = options;
  const errorsToRescue = [
    ErrorRegionaleNotFound,
    ErrorFormationNotFound,
    ErrorCertificationNotFound,
    ErrorCertificationsNotFound,
    ErrorNoDataForMillesime,
    ErrorNoDataAvailable,
  ];

  try {
    return await cb();
  } catch (err) {
    if (imageOnError !== "false" && ext === "svg") {
      if (errorsToRescue.some((error) => err instanceof error)) {
        if (imageOnError === "empty") {
          return sendErrorSvgEmpty(res, options);
        }

        return sendErrorSvg(
          res,
          {
            ...data,
            ...(data.regionCode ? { region: findRegionByCode(data.regionCode) } : {}),
          },
          options
        );
      }
    }

    throw err;
  }
}
