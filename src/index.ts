import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppError } from "./shared/app-error";
import { StatusCodes } from "http-status-codes";
import { logger, loggerMiddleware } from "@/shared/logger";
import { errorHandler } from "./shared/error-handler";
import { httpHandlers, socketHandlers } from "./handlers";
import { runDatabase } from "./shared/database";
// import { createServer as createHttpsServer } from "https";
import { createServer as createHttpServer } from "http";
import { initSocket } from "./shared/socket";
import cors from "cors";
// import { readFileSync } from "node:fs";

export const app = express();
const PORT = 3000;

// const options = {
//   key: readFileSync("key.pem"),
//   cert: readFileSync("cert.pem"),
// };

runDatabase();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
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

declare module "express" {
  interface Request {
    token?: string;
  }
}

app.use((req: Request, _, next) => {
  const headerToken = req.headers.authorization?.split(" ")[1];

  req.token = headerToken;

  return next();
});

app.get("/", (_: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.use(httpHandlers);

// 404 middleware
app.all("*", (_: Request, __: Response, next) => {
  const error = new AppError(StatusCodes.NOT_FOUND, "Not found");

  next(error);
});

const server = createHttpServer(app);

const io = initSocket(server);

// Register per-module socket handlers
io.on("connection", async (socket) => {
  for (const socketHandler of socketHandlers) {
    if (socketHandler.name === "AsyncFunction") await socketHandler(socket, io);
    else socketHandler(socket, io);
  }
});

// eslint-disable-next-line
app.use((err: AppError, _: Request, res: Response, __: NextFunction) => {
  errorHandler(err, res);
});

server.listen(PORT, "0.0.0.0", () => {
  logger.info(
    `server is running on http://localhost:${PORT} - http://192.168.1.9:${PORT}`,
  );
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
