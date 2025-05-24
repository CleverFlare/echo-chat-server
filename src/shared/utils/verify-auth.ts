import { NextFunction, Request, Response } from "express";
import { AppError } from "../app-error";
import { StatusCodes } from "http-status-codes";
import { jwtVerify } from "jose";
import { env } from "@/env";
import { JWTExpired, JWTInvalid } from "jose/errors";

export const verifyAuth =
  () =>
  async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    if (!req.token) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, "You need to login first"),
      );
    }

    try {
      await jwtVerify(req.token, new TextEncoder().encode(env.JWT_PRIVATE));
      return next();
    } catch (err) {
      if (err instanceof JWTExpired) {
        return next(
          new AppError(
            StatusCodes.UNAUTHORIZED,
            "Your login session has expired",
          ),
        );
      }

      if (err instanceof JWTInvalid) {
        return next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid JWT"));
      }

      console.error("ERROR", err);
      return next(
        new AppError(
          StatusCodes.UNAUTHORIZED,
          "Auth error: Unknown error occurred, check the back-end logs",
        ),
      );
    }
  };
