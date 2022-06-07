//@ts-check
import { consumptionMiddleware } from "./consumptionMiddleware.js";

/**
 * @type  {import("../types").AsyncTryCatchHandler}
 */
export function tryCatch(callback) {
  return async (req, res, next) => {
    try {
      await consumptionMiddleware(req);
      await callback(req, res, next);
    } catch (e) {
      //Force the async routes to be handled by the error middleware
      return next(e);
    }
  };
}
