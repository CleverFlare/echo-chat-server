/**
 * Query operator definitions
 */

export type Operators = {
  EQ: "=";
  GT: ">";
  LT: "<";
  GTE: ">=";
  LTE: "<=";
  IN: "IN";
};

// Operators allowed for each primitive type
export type PrimitiveOperators = {
  UUID: Operators["EQ"];
  TEXT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  TIMESTAMP: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  ASCII: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  BIGINT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  DATE: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  DECIMAL: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  DOUBLE: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  FLOAT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  INET: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  INT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  SMALLINT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  TIME: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  TIMEUUID: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  TINYINT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  VARCHAR: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  VARINT: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  BLOB: Operators["EQ" | "IN"];
  BOOLEAN: Operators["EQ" | "IN"];
  COUNTER: Operators["EQ" | "IN"];
};
