import { compose } from "compose-middleware";

export function authMiddleware() {
  return compose((req, res, next) => {
    next();
  });
}
