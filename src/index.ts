import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppError } from "./shared/app-error";
import { StatusCodes } from "http-status-codes";
import { logger, loggerMiddleware } from "@/shared/logger";
import { errorHandler } from "./shared/error-handler";
import handlers from "./handlers";
import { runDatabase } from "./shared/database";
import { createServer } from "http";
import { WebSocket } from "ws";

export const app = express();
const PORT = 3000;

runDatabase();

app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use((_, res, next) => {
  const oldJson = res.json;

  res.json = (body: string) => {
    res.locals.data = body;
    return oldJson.call(res, body);
  };

  const oldSend = res.send;

  res.send = (body: string) => {
    res.locals.data = body;
    return oldSend.call(res, body);
  };

  next();
});

app.use(loggerMiddleware);
app.get("/", (_: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use(handlers);

// 404 middleware
app.all("*", (_: Request, __: Response, next) => {
  const error = new AppError(StatusCodes.NOT_FOUND, "Not found");

  next(error);
});

const server = createServer(app);

const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("WebSocket closed");
  });
});

// eslint-disable-next-line
app.use((err: AppError, _: Request, res: Response, __: NextFunction) => {
  errorHandler(err, res);
});

server.listen(PORT, () => {
  logger.info(`server is running on http://localhost:${PORT}`);
});

process.on("uncaughtException", (err) => {
  logger.error(err.name, err.message);
  logger.fatal("UNHANDLED REJECTION! 💥 Shutting down...");

  errorHandler(err as AppError);

  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  logger.error("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.fatal("HTTP server closed");
  });
});
