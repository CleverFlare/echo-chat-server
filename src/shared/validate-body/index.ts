import { NextFunction, Request, Response } from "express";
import { AppError } from "../app-error";
import { StatusCodes } from "http-status-codes";
import { z, ZodError } from "zod/v4";

export const validateBody =
  (schema: z.ZodAny) =>
  async (req: Request, _: Response, next: NextFunction) => {
    try {
      const value = await schema.parseAsync(req.body);
      req.body = value; // ✅ this replaces the raw body with the transformed version
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        error.issues.forEach((issue) => {
          const key = issue.path.join(".");
          formattedErrors[key] = issue.message;
        });

        return next(
          new AppError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            JSON.stringify(formattedErrors),
          ),
        );
      }
      return next(error);
    }
  };
