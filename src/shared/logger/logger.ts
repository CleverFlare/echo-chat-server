import pino from "pino";
import PinoPretty from "pino-pretty";
import { CustomPrettyOptions } from "./types";

// regular logger
export const logger = pino(
  PinoPretty({
    colorize: true,
    translateTime: "yyyy-mm-dd HH:MM:ss.l Z",
    ignore: "pid,hostname",
  } as CustomPrettyOptions),
);
