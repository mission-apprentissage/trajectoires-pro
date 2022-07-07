import { DateTime } from "luxon";
import { buildDescription } from "../../common/stats/description.js";
import { buildWidget, isWidgetAvailable, prepareStatsForWidget } from "../widget/widget.js";
import Boom from "boom";

export function addJsonHeaders(res) {
  res.setHeader("Content-Type", `application/json`);
}

export function addCsvHeaders(res, options = {}) {
  let fullname = `${options.filename || "export"}-${DateTime.now().toISODate()}.csv`;
  res.setHeader("Content-disposition", `attachment; filename=${fullname}`);
  res.setHeader("Content-Type", `text/csv; charset=UTF-8`);
}

export async function sendStats(stats, res, options = {}) {
  const { ext, theme, direction } = options;
  const description = buildDescription(stats);
  const metadata = { ...stats._meta, ...description };

  if (ext !== "svg") {
    return res.json({ ...stats, _meta: metadata });
  } else {
    if (!isWidgetAvailable(stats)) {
      throw Boom.notFound("Données non disponibles");
    }

    const widget = await buildWidget(
      "formation",
      { stats: prepareStatsForWidget(stats), description },
      { theme, direction }
    );

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(widget);
  }
}
