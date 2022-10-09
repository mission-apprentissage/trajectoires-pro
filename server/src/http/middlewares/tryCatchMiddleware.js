import { metricsMiddleware } from "./metricsMiddleware.js";

export function tryCatch(callback) {
  return async (req, res, next) => {
    try {
      await metricsMiddleware(req);
      await callback(req, res, next);
    } catch (e) {
      //Force the async routes to be handled by the error middleware
      return next(e);
    }
  };
}
