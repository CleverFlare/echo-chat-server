import { NextFunction, Request, Response } from "express";
import { AppError } from "../app-error";
import { StatusCodes } from "http-status-codes";
import { jwtVerify } from "jose";
import { env } from "@/env";
import { JWTExpired, JWTInvalid } from "jose/errors";
import { client } from "../database";

export const verifyAuth =
  () =>
  async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    if (!req.token) {
      return next(
        new AppError(StatusCodes.UNAUTHORIZED, "You need to login first"),
      );
    }

    try {
      const {
        payload: {
          data: { id },
        },
      } = await jwtVerify<{ data: { id: string } }>(
        req.token,
        new TextEncoder().encode(env.JWT_PRIVATE),
      );

      const result = await client.execute(
        "SELECT * FROM user_by_id WHERE id=?",
        [id],
        { prepare: true },
      );

      if (result.rows.length <= 0) throw new JWTInvalid();

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
