import { Operators } from "./types";

export const operators = {
  // text-like — comparable, so full range operators apply
  text: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  ascii: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  varchar: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },

  // identifiers — uuid has no ordering, timeuuid does
  uuid: {
    partition: ["=", "in"] as const,
    clustering: ["="] as const,
    regular: ["=", "!=", "in"] as const,
  },
  timeuuid: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },

  // numeric
  bigint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  int: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  smallint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  tinyint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  varint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  float: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  double: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  decimal: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },

  // boolean — no ordering
  boolean: {
    partition: ["=", "in"] as const,
    clustering: ["=", "in"] as const,
    regular: ["=", "!=", "in"] as const,
  },

  // binary — no ordering
  blob: {
    partition: ["=", "in"] as const,
    clustering: ["=", "in"] as const,
    regular: ["=", "!=", "in"] as const,
  },

  // temporal
  timestamp: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  date: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
  time: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },

  // network
  inet: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
    regular: ["=", "!=", "<", ">", "<=", ">=", "in"] as const,
  },
} as const satisfies Record<string, Operators>;
