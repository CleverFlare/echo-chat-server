import { RedisClient } from "bun";
import { ChannelEventMap, ExtractParams } from "./types";
import logger from "@/utils/logger";

export const publisher = new RedisClient(process.env.REDIS_URL);
export const subscriber = new RedisClient(process.env.REDIS_URL);

export const publish = <const Channel extends keyof ChannelEventMap>(
  channel: Channel,
  ...args: keyof ExtractParams<Channel> extends never
    ? [event: ChannelEventMap[Channel]]
    : [params: ExtractParams<Channel>, event: ChannelEventMap[Channel]]
) => {
  const [params, event] = (
    args.length === 2 ? [args[0], args[1]] : [{}, args[0]]
  ) as [Record<string, string>, ChannelEventMap[Channel]];

  const resolvedChannel = channel.replace(
    /\[(\w+)\]/g,
    (_, key) => params[key],
  );

  publisher.publish(resolvedChannel, JSON.stringify(event));
};

export const subscribe = <const Channel extends keyof ChannelEventMap>(
  channel: Channel,
  ...args: keyof ExtractParams<Channel> extends never
    ? [handler: (message: ChannelEventMap[Channel]) => void | Promise<void>]
    : [
        params: ExtractParams<Channel>,
        handler: (message: ChannelEventMap[Channel]) => void | Promise<void>,
      ]
) => {
  const [params, handler] = (
    args.length === 2 ? [args[0], args[1]] : [{}, args[0]]
  ) as [
    Record<string, string>,
    (message: ChannelEventMap[Channel]) => void | Promise<void>,
  ];

  const resolvedChannel = channel.replace(
    /\[(\w+)\]/g,
    (_, key) => params[key],
  );

  subscriber.subscribe(resolvedChannel, (message: string) =>
    Promise.resolve(handler(JSON.parse(message))).catch(logger.error),
  );
};
