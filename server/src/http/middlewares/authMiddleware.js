import config from "../../config.js";
import passport from "passport";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { compose } from "compose-middleware";

passport.use(
  "api-key",
  new HeaderAPIKeyStrategy({}, false, function (apiKey, done) {
    if (config.inserJeunes.api.key !== apiKey) {
      return done(null, false);
    }

    return done(null, { apikey: apiKey });
  })
);

export function checkApiKey() {
  return compose((req, res, next) => {
    if (req.query.apiKey) {
      req.headers["x-api-key"] = req.query.apiKey;
      delete req.query.apiKey;
    }
    next();
  }, passport.authenticate("api-key", { session: false, failWithError: true, assignProperty: "user" }));
}
