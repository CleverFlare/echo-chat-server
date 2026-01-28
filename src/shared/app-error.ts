import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    public statusCode: StatusCodes,
    message: string,
    public isOperational: boolean = true,
    public stack: string = "",
  ) {
    super(message);
    if (!stack) Error.captureStackTrace(this, this.constructor);
  }
}
