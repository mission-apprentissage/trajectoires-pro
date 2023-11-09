import config from "#src/config.js";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { HeaderAPIKeyStrategy } from "passport-headerapikey";
import { compose } from "compose-middleware";
import * as Auth from "#src/services/auth/index.js";
import { ErrorNotAuthorized } from "../errors.js";

// Legacy api key authentication
passport.use(
  "api-key",
  new HeaderAPIKeyStrategy({}, false, function (apiKey, done) {
    if (config.inserJeunes.api.key !== apiKey) {
      return done(null, false);
    }

    return done(null, { apikey: apiKey });
  })
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromHeader("x-api-key"),
      ]),
      secretOrKey: config.auth.jwtSecret,
      issuer: config.auth.jwtIssuer,
      passReqToCallback: true,
    },
    async function (req, jwtPayload, done) {
      try {
        const user = await Auth.User.getUser(jwtPayload.username);

        if (!user) {
          return done(null, false);
        }

        req.user = user;
        done(null, jwtPayload);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

function passportCallback(role, req, res, next) {
  return (err, user) => {
    if (err || !Auth.hasPermission(role, user)) {
      return next(new ErrorNotAuthorized());
    }
    next();
  };
}
export function authMiddleware(role) {
  return compose(
    (req, res, next) => {
      if (req.query.apiKey) {
        req.headers["x-api-key"] = req.query.apiKey;
        delete req.query.apiKey;
      }
      next();
    },
    (req, res, next) => {
      passport.authenticate(
        ["api-key", "jwt"],
        {
          session: false,
        },
        passportCallback(role, req, res, next)
      )(req, res, next);
    },
    (req, res, next) => {
      next();
    }
  );
}
