import pino from "pino";
import PinoPretty from "pino-pretty";
import { CustomPrettyOptions, Log } from "./types";
import { format } from "date-fns";
import { Colorette } from "colorette";
import { parseData } from "./parse-data";

// api-specific logger
export const apiLogger = pino(
  PinoPretty({
    colorize: true,
    ignore: "pid,hostname,level,time",
    singleLine: true,
    hideObject: true,
    messageFormat: (
      log: Log,
      _: unknown,
      __: unknown,
      { colors }: { colors: Colorette },
    ) => {
      return `${colors.gray(`[${format(new Date(log.time as number), "dd-M-y k:m:s-SS O")}]`)} ${colors.green(log.data.method.toUpperCase())} [${colors.cyan(log.data.route)}] ${colors.white(log.data.statusCode)}: ${colors.white(parseData(log.data.data))}\n`;
    },
  } as CustomPrettyOptions),
);
