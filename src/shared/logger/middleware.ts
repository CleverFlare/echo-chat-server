import { NextFunction, Request, Response } from "express";
import { apiLogger } from "./api-logger";
import { Log } from "./types";

// api logger middleware
export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    apiLogger.info({
      data: {
        route: req.path,
        statusCode: res.statusCode,
        method: req.method,
        data: res.locals.data as ResponseType,
        response: res,
        request: req,
      },
    } as { data: Log["data"] });
  });
  next();
}
