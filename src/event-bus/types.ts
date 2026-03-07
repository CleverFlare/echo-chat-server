import { InferSchema } from "@/cql/types";
import { friendRequests } from "@/modules/contacts/schema";
import { CamelCasedProperties } from "type-fest";

export type ChannelEventMap = {
  "new-contact": unknown;
  Ping: "Pong";
  "new-friend-requests:[id]": CamelCasedProperties<
    InferSchema<typeof friendRequests>
  >;
};

export type ExtractParams<S extends string> =
  S extends `${string}[${infer Param}]${infer Rest}`
    ? { [K in Param | keyof ExtractParams<Rest>]: string }
    : //  eslint-disable-next-line
      {};
