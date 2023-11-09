import { isEmpty } from "lodash-es";
import { metrics } from "#src/common/db/collections/collections.js";
import { logger } from "#src/common/logger.js";
import { formatArrayParameters } from "#src/http/utils/formatters.js";

export function buildMetrics(req) {
  const referer = req.headers["referer"] && req.headers["referer"].split("/")[2];
  const origin = req.headers["origin"] && req.headers["origin"].split("/")[2];
  const xForwardedFor = req.headers["x-forwarded-for"] && req.headers["x-forwarded-for"]?.split(",").shift();
  const remoteAddress = req.socket?.remoteAddress;

  const consumer = referer ?? origin ?? xForwardedFor ?? remoteAddress;
  const url = req.url;
  const time = new Date();
  const extension = url?.split("?")[0]?.split(".")?.[1];
  const uai = req.params?.uai;
  const code_certification = req.params?.code_certification;
  // TODO : the API use codes_certifications or code_certifications, change to only use one type
  const codes_certifications = [
    ...(req.params?.codes_certifications ? formatArrayParameters(req.params?.codes_certifications) : []),
    ...(req.params?.code_certifications ? formatArrayParameters(req.params?.code_certifications) : []),
    ...(req.query?.code_certifications ? formatArrayParameters(req.query?.code_certifications) : []),
    ...(code_certification ? [code_certification] : []),
  ];
  const regions = [
    ...(req.params?.regions ? formatArrayParameters(req.params?.regions) : []),
    ...(req.query?.regions ? formatArrayParameters(req.query?.regions) : []),
    ...(req.params?.region ? [req.params?.region] : []),
  ];

  const user = req.user ? req.user.username : null;

  return { time, consumer, url, extension, uai, code_certification, codes_certifications, regions, user };
}

export const metricsMiddleware = async (req) => {
  try {
    const { time, consumer, url, extension, uai, code_certification, codes_certifications, regions, user } =
      buildMetrics(req);
    await metrics().insertOne({
      time,
      consumer,
      url,
      ...(user ? { user } : {}),
      ...(extension ? { extension } : {}),
      ...(uai ? { uai } : {}),
      ...(code_certification ? { code_certification } : {}),
      ...(!isEmpty(codes_certifications) ? { codes_certifications } : {}),
      ...(!isEmpty(regions) ? { regions } : {}),
    });
  } catch (e) {
    logger.error(e);
  }
};
