import express from "express";
import Joi from "joi";
import { authMiddleware } from "#src/http/middlewares/authMiddleware.js";
import { tryCatch } from "#src/http/middlewares/tryCatchMiddleware.js";
import { validate } from "#src/http/utils/validators.js";
import { login } from "#src/services/auth/auth.js";
import { ErrorWrongCredentials } from "#src/services/auth/error.js";
import * as ErrorsHttp from "../errors.js";

export default () => {
  const router = express.Router();

  router.post(
    "/api/inserjeunes/auth/login",
    authMiddleware("public"),
    tryCatch(async (req, res) => {
      const { username, password } = await validate(
        { ...req.body },
        {
          username: Joi.string().required(),
          password: Joi.string().required(),
        }
      );

      try {
        const token = await login({ username, password });
        res.json({ token: token });
      } catch (err) {
        throw err instanceof ErrorWrongCredentials ? new ErrorsHttp.ErrorWrongCredentials() : err;
      }
    })
  );

  return router;
};
