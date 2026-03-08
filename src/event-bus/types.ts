import { InferSchema } from "@/cql/types";
import { friendRequests } from "@/modules/contacts/schema";
import { CamelCasedProperties } from "type-fest";

export type ChannelEventMap = {
  ping: {
    event: "ping";
    version: 1;
    occurredAt: string;
    payload: "pong";
  };
  "friend.request.received:[id]": {
    event: "friend.request.received";
    version: 1;
    occurredAt: string;
    payload: CamelCasedProperties<InferSchema<typeof friendRequests>>;
  };
  "friend.request.responded:[id]": {
    event: "friend.request.responded";
    version: 1;
    occurredAt: string;
    payload: { userId: string; status: "accepted" | "rejected" };
  };
};

export type ExtractParams<S extends string> =
  S extends `${string}[${infer Param}]${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : //  eslint-disable-next-line
      {};
