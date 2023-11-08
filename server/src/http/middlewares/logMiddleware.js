import { omitBy } from "lodash-es";
import { logger } from "#src/common/logger.js";

function errorLevel(req, res, error) {
  const statusCode = res.statusCode;

  if (statusCode === 404) {
    return "warn";
  }

  if (error || (statusCode >= 400 && statusCode < 600)) {
    return "error";
  }
  return "info";
}

export function logMiddleware() {
  return (req, res, next) => {
    const relativeUrl = (req.baseUrl || "") + (req.url || "");
    const startTime = new Date().getTime();
    const withoutSensibleFields = (obj) => {
      return omitBy(obj, (value, key) => {
        const lower = key.toLowerCase();
        return lower.indexOf("token") !== -1 || ["authorization", "password"].includes(lower);
      });
    };

    const log = () => {
      try {
        const error = req.err;
        const statusCode = res.statusCode;
        const data = {
          type: "http",
          elapsedTime: new Date().getTime() - startTime,
          user: req.user ? req.user.username : null,
          request: {
            requestId: req.requestId,
            method: req.method,
            headers: {
              ...withoutSensibleFields(req.headers),
            },
            url: {
              relative: relativeUrl,
              path: (req.baseUrl || "") + (req.path || ""),
              parameters: withoutSensibleFields(req.query),
            },
            body: withoutSensibleFields(req.body),
          },
          response: {
            status: statusCode,
            headers: res.getHeaders(),
          },
          ...(!error
            ? {}
            : {
                error: {
                  ...error,
                  message: error.message,
                  stack: error.stack,
                },
              }),
        };

        const level = errorLevel(req, res, error);
        logger[level](data, `Http Request ${level !== "info" ? "KO" : "OK"}`);
      } finally {
        res.removeListener("finish", log);
        res.removeListener("close", log);
      }
    };

    res.on("close", log);
    res.on("finish", log);

    next();
  };
}
