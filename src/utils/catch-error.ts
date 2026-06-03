import { NextFunction, Request, RequestHandler, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export const catchError = <
  Params extends ParamsDictionary = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  fn: (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler<Params, ResBody, ReqBody, ReqQuery> => {
  return async (
    req: Request<Params, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction,
  ) => {
    fn(req, res, next).catch(next);
  };
};
