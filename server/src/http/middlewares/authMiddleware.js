const config = require("../../config");
const passport = require("passport");
const { HeaderAPIKeyStrategy } = require("passport-headerapikey");
var compose = require("compose-middleware").compose;

passport.use(
  "api-key",
  new HeaderAPIKeyStrategy({}, false, function (apiKey, done) {
    if (config.insertJeunes.api.key !== apiKey) {
      return done(null, false);
    }

    return done(null, { apikey: apiKey });
  })
);

function checkApiKey() {
  return compose((req, res, next) => {
    if (req.query.apiKey) {
      req.headers["x-api-key"] = req.query.apiKey;
      delete req.query.apiKey;
    }
    next();
  }, passport.authenticate("api-key", { session: false, failWithError: true, assignProperty: "user" }));
}

module.exports = {
  checkApiKey,
};
