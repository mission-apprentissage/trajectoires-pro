//@ts-check

/**
 * @type  {import("../types").AsyncTryCatchHandler}
 */
const asyncTryCatchHandler = (callback) => {
  return async (req, res, next) => {
    try {
      await callback(req, res, next);
    } catch (e) {
      //Force the async routes to be handled by the error middleware
      return next(e);
    }
  };
};

module.exports = asyncTryCatchHandler;
