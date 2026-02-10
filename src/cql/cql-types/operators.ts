import { BaseMeta, Operators } from "./types";

export const operators = {
  text: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  } as const,
  ascii: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },

  varchar: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },

  // identifiers
  uuid: {
    partition: ["=", "in"] as const,
    clustering: ["="] as const,
  } as const,
  timeuuid: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },

  // numeric
  bigint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  int: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  smallint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  tinyint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  varint: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  float: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  double: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  decimal: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },

  // boolean
  boolean: {
    partition: ["=", "in"] as const,
    clustering: ["=", "in"] as const,
  },

  // binary
  blob: {
    partition: ["=", "in"] as const,
    clustering: ["=", "in"] as const,
  },

  // temporal
  timestamp: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
  date: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  }, // CQL date is days since epoch
  time: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  }, // nanoseconds since midnight

  // network
  inet: {
    partition: ["=", "in"] as const,
    clustering: ["=", "<", ">", "<=", ">=", "in"] as const,
  },
} as const satisfies Record<string, Operators>;
