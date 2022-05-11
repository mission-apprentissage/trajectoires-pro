import express = require("express");
import core = require("express-serve-static-core");

export type AsyncTryCatchHandler<P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = core.Query> = (
  handler: (
    ...args: Parameters<express.RequestHandler<P, ResBody, ReqBody, ReqQuery>>
  ) => ReturnType<express.NextFunction>
) => express.RequestHandler<P, ResBody, ReqBody, ReqQuery>;
