import type { Express } from "express";
import { StatusCodes } from "http-status-codes";

// Entry point for all http routes.
// You should explicitly add routers here using `app.use`.
export function registerHttpRoutes(app: Express) {
  app.get("/users", (_, res) => {
    res.status(StatusCodes.OK).send("Hello, World!");
  });
}
