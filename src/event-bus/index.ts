import { RedisClient } from "bun";
import { ChannelEventMap } from "./types";

export const publisher = new RedisClient(process.env.REDIS_URL);
export const subscriber = new RedisClient(process.env.REDIS_URL);

export const publish = <const Channel extends keyof ChannelEventMap>(
  channel: Channel,
  event: ChannelEventMap[Channel],
) => {
  publisher.publish(channel, JSON.stringify(event));
};

export const subscribe = <const Channel extends keyof ChannelEventMap>(
  channel: Channel,
  handler: (message: ChannelEventMap[Channel]) => void,
) => {
  subscriber.subscribe(channel, (message: string) =>
    handler(JSON.parse(message)),
  );
};
