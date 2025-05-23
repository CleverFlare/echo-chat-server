import { Response } from "express";
import { AppError } from "../../shared/app-error";
import { logger } from "../logger";

export const errorHandler = (err: AppError, res?: Response) => {
  logger.info(err);

  if (!err?.isOperational) {
    process.exit(1);
  }

  if (res) {
    try {
      res.status(err.statusCode).json(JSON.parse(err.message));
    } catch {
      res.status(err.statusCode).json({ message: err.message });
    }
  }
};
