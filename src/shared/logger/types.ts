import { Colorette } from "colorette";
import { Request, Response } from "express";
import { PrettyOptions } from "pino-pretty";

export type ResponseType = string | Record<string, unknown> | unknown[];

export type Log = {
  level: number;
  time: number;
  pid: number;
  hostname: string;
  msg: string;
  data: {
    statusCode: number;
    method: string;
    route: string;
    data: ResponseType;
    response: Response;
    request: Request;
  };
};

export type CustomPrettyOptions = PrettyOptions & {
  messageFormat: (
    log: Log,
    _: unknown,
    __: unknown,
    { colors }: { colors: Colorette },
  ) => string;
};
