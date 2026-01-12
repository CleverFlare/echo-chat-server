import type { Express } from "express";
import { StatusCodes } from "http-status-codes";

export function registerHttpRoutes(app: Express) {
  app.get("/users", (_, res) => {
    res.status(StatusCodes.OK).send("Hello, World!");
  });
}
