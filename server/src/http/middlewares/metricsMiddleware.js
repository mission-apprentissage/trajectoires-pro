// @ts-check

import { metrics } from "../../common/db/collections.js";
import { logger } from "../../common/logger.js";

export const metricsMiddleware = async (req) => {
  try {
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

    await metrics().insertOne({
      time,
      consumer,
      url,
      ...(extension ? { extension } : {}),
      ...(uai ? { uai } : {}),
      ...(code_certification ? { code_certification } : {}),
    });
  } catch (e) {
    logger.error(e);
  }
};
