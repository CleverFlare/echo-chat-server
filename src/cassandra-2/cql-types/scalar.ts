import { CqlType, ScalarMeta } from "./types";

export const scalarTypes = [
  "uuid",
  "text",
  "timestamp",
  "ascii",
  "bigint",
  "blob",
  "boolean",
  "date",
  "decimal",
  "double",
  "float",
  "inet",
  "int",
  "smallint",
  "time",
  "timeuuid",
  "tinyint",
  "varchar",
  "varint",
] as const;

export type ScalarType = Lowercase<(typeof scalarTypes)[number]>;

function scalar<T>(cql: string) {
  return {
    cql,
    _meta: {
      kind: "scalar" as const,
      ts: undefined as unknown as T,
    },
  } satisfies CqlType<T, "scalar", ScalarMeta<T>>;
}

export const types = {
  // text-like
  text: scalar<string>("TEXT"),
  ascii: scalar<string>("ASCII"),
  varchar: scalar<string>("VARCHAR"),

  // identifiers
  uuid: scalar<string>("UUID"),
  timeuuid: scalar<string>("TIMEUUID"),

  // numeric
  bigint: scalar<number>("BIGINT"),
  int: scalar<number>("INT"),
  smallint: scalar<number>("SMALLINT"),
  tinyint: scalar<number>("TINYINT"),
  varint: scalar<number>("VARINT"),
  float: scalar<number>("FLOAT"),
  double: scalar<number>("DOUBLE"),
  decimal: scalar<number>("DECIMAL"),

  // boolean
  boolean: scalar<boolean>("BOOLEAN"),

  // binary
  blob: scalar<Uint8Array>("BLOB"),

  // temporal
  timestamp: scalar<Date>("TIMESTAMP"),
  date: scalar<string>("DATE"), // CQL date is days since epoch
  time: scalar<string>("TIME"), // nanoseconds since midnight

  // network
  inet: scalar<string>("INET"),
} as const;
