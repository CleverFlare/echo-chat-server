import { TypeDef, PrimitiveMetadata } from "./metadata";

/**
 * Cassandra primitive type mappings
 */

export type CassandraTypeMap = {
  UUID: string;
  TEXT: string;
  TIMESTAMP: Date | number;
  ASCII: string;
  BIGINT: bigint | number;
  DATE: Date | string;
  DECIMAL: number;
  DOUBLE: number;
  FLOAT: number;
  INET: string;
  INT: number;
  SMALLINT: number;
  TIME: Date | string;
  TIMEUUID: string;
  TINYINT: number;
  VARCHAR: string;
  VARINT: bigint | number;
  BLOB: Buffer | Uint8Array;
  BOOLEAN: boolean;
  COUNTER: number;
};

export type CassandraTypeUpper = keyof CassandraTypeMap;
export type CassandraTypeLower = Lowercase<CassandraTypeUpper>;

// Helper to create a primitive type definition
function createPrimitive<T extends CassandraTypeUpper>(
  cqlType: Lowercase<T>,
): TypeDef<CassandraTypeMap[T]> {
  return {
    _tsType: null as unknown as CassandraTypeMap[T],
    _metadata: {
      kind: "primitive",
      cqlType,
    } as PrimitiveMetadata,
  };
}

// Primitive type constructors
export const types = {
  uuid: createPrimitive<"UUID">("uuid"),
  text: createPrimitive<"TEXT">("text"),
  timestamp: createPrimitive<"TIMESTAMP">("timestamp"),
  ascii: createPrimitive<"ASCII">("ascii"),
  bigint: createPrimitive<"BIGINT">("bigint"),
  date: createPrimitive<"DATE">("date"),
  decimal: createPrimitive<"DECIMAL">("decimal"),
  double: createPrimitive<"DOUBLE">("double"),
  float: createPrimitive<"FLOAT">("float"),
  inet: createPrimitive<"INET">("inet"),
  int: createPrimitive<"INT">("int"),
  smallint: createPrimitive<"SMALLINT">("smallint"),
  time: createPrimitive<"TIME">("time"),
  timeuuid: createPrimitive<"TIMEUUID">("timeuuid"),
  tinyint: createPrimitive<"TINYINT">("tinyint"),
  varchar: createPrimitive<"VARCHAR">("varchar"),
  varint: createPrimitive<"VARINT">("varint"),
  blob: createPrimitive<"BLOB">("blob"),
  boolean: createPrimitive<"BOOLEAN">("boolean"),
  counter: createPrimitive<"COUNTER">("counter"),
} as const;
