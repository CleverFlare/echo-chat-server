import { operators } from "./operators";
import { CqlType, Operators, ScalarMeta } from "./types";

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

function scalar<T, const O extends Operators>(
  cql: string,
  operators: O,
): CqlType<T, "scalar", ScalarMeta<T, O>> {
  return {
    cql,
    _meta: {
      kind: "scalar" as const,
      ts: undefined as unknown as T,
      operators: operators as O,
    },
  };
}

export const types = {
  // text-like
  text: scalar<string, typeof operators.text>("TEXT", operators.text),
  ascii: scalar<string, typeof operators.ascii>("ASCII", operators.ascii),
  varchar: scalar<string, typeof operators.varchar>(
    "VARCHAR",
    operators.varchar,
  ),

  // identifiers
  uuid: scalar<string, typeof operators.uuid>("UUID", operators.uuid),
  timeuuid: scalar<string, typeof operators.timeuuid>(
    "TIMEUUID",
    operators.timeuuid,
  ),

  // numeric
  bigint: scalar<number, typeof operators.bigint>("BIGINT", operators.bigint),
  int: scalar<number, typeof operators.int>("INT", operators.int),
  smallint: scalar<number, typeof operators.smallint>(
    "SMALLINT",
    operators.smallint,
  ),
  tinyint: scalar<number, typeof operators.tinyint>(
    "TINYINT",
    operators.tinyint,
  ),
  varint: scalar<number, typeof operators.varint>("VARINT", operators.varint),
  float: scalar<number, typeof operators.float>("FLOAT", operators.float),
  double: scalar<number, typeof operators.double>("DOUBLE", operators.double),
  decimal: scalar<number, typeof operators.decimal>(
    "DECIMAL",
    operators.decimal,
  ),

  // boolean
  boolean: scalar<boolean, typeof operators.boolean>(
    "BOOLEAN",
    operators.boolean,
  ),

  // binary
  blob: scalar<Uint8Array, typeof operators.blob>("BLOB", operators.blob),

  // temporal
  timestamp: scalar<Date, typeof operators.timestamp>(
    "TIMESTAMP",
    operators.timestamp,
  ),
  date: scalar<string, typeof operators.date>("DATE", operators.date),
  time: scalar<string, typeof operators.time>("TIME", operators.time),

  // network
  inet: scalar<string, typeof operators.inet>("INET", operators.inet),
} as const;
