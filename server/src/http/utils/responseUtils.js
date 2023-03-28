import { DateTime } from "luxon";
import { buildWidget, isWidgetAvailable, prepareStatsForWidget } from "../widget/widget.js";
import Boom from "boom";
import { buildDescription, buildDescriptionFiliere } from "../../common/stats.js";
import { isEmpty } from "lodash-es";

export function addJsonHeaders(res) {
  res.setHeader("Content-Type", `application/json`);
}

export function addCsvHeaders(res, options = {}) {
  let fullname = `${options.filename || "export"}-${DateTime.now().toISODate()}.csv`;
  res.setHeader("Content-disposition", `attachment; filename=${fullname}`);
  res.setHeader("Content-Type", `text/csv; charset=UTF-8`);
}

export async function sendStats(type, stats, res, options = {}) {
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
      type,
      {
        stats: prepareStatsForWidget(stats),
        description,
        millesime: stats.millesime,
        region: stats.region,
      },
      { theme, direction }
    );

    res.setHeader("content-type", "image/svg+xml");
    return res.status(200).send(widget);
  }
}

export async function sendFilieresStats(filieresStats, res, options = {}) {
  const { ext } = options;

  if (isEmpty(filieresStats)) {
    throw Boom.notFound("Certifications inconnues");
  }

  if (ext !== "svg") {
    return res.json(filieresStats);
  } else {
    const { pro, apprentissage } = filieresStats;
    if (!isWidgetAvailable(pro) && !isWidgetAvailable(apprentissage)) {
      throw Boom.notFound("Données non disponibles");
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
