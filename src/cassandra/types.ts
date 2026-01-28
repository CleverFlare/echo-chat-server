// Type to represent a UDT that's been created via your builder
export type UDTReference<
  TFields extends Record<string, ExtendedCassandraType>,
> = {
  type: {
    [K in keyof TFields]: ExtractType<TFields[K]>;
  };
  cqlType: string; // Just the name of the UDT
  operators: Operators["EQ"];
  _meta: { kind: "udt"; name: string; fields: TFields };
};

// Base collection types without frozen
export type BaseCollectionType =
  | {
      // eslint-disable-next-line
      type: Map<any, any>;
      operators: Operators["EQ"];
      _meta: {
        kind: "map";
        keyType: CassandraSimpleType;
        valueType: CassandraSimpleType;
      };
    }
  | {
      // eslint-disable-next-line
      type: Set<any>;
      operators: Operators["EQ"];
      _meta: { kind: "set"; elementType: CassandraSimpleType };
    }
  | {
      // eslint-disable-next-line
      type: any[];
      operators: Operators["EQ"];
      _meta: { kind: "list"; elementType: CassandraSimpleType };
    }
  | {
      // eslint-disable-next-line
      type: any[];
      operators: Operators["EQ"];
      _meta: { kind: "tuple"; types: readonly CassandraSimpleType[] };
    }
  // eslint-disable-next-line
  | UDTReference<any>;

// Frozen wrapper type
export type FrozenType<T extends BaseCollectionType> = T & {
  _meta: T["_meta"] & { frozen: true };
};

// Full collection type definition including frozen
export type CollectionTypeDefinition =
  | BaseCollectionType
  | FrozenType<BaseCollectionType>;

// Helper types for type constructors
type MapType<K extends CassandraSimpleType, V extends CassandraSimpleType> = {
  type: Map<
    CassandraTypeMap[Uppercase<K>]["type"],
    CassandraTypeMap[Uppercase<V>]["type"]
  >;
  operators: Operators["EQ"];
  _meta: { kind: "map"; keyType: K; valueType: V };
};

type SetType<T extends CassandraSimpleType> = {
  type: Set<CassandraTypeMap[Uppercase<T>]["type"]>;
  operators: Operators["EQ"];
  _meta: { kind: "set"; elementType: T };
};

type ListType<T extends CassandraSimpleType> = {
  type: CassandraTypeMap[Uppercase<T>]["type"][];
  operators: Operators["EQ"];
  _meta: { kind: "list"; elementType: T };
};

type TupleType<T extends readonly CassandraSimpleType[]> = {
  type: {
    [K in keyof T]: T[K] extends CassandraSimpleType
      ? CassandraTypeMap[Uppercase<T[K]>]["type"]
      : never;
  };
  operators: Operators["EQ"];
  _meta: { kind: "tuple"; types: T };
};

// Runtime constructors with proper return types
export const collection = {
  map: <K extends CassandraSimpleType, V extends CassandraSimpleType>(
    keyType: K,
    valueType: V,
  ): MapType<K, V> => ({
    // eslint-disable-next-line
    type: new Map() as any,
    operators: "=" as const,
    _meta: { kind: "map", keyType, valueType },
  }),

  set: <T extends CassandraSimpleType>(elementType: T): SetType<T> => ({
    // eslint-disable-next-line
    type: new Set() as any,
    operators: "=" as const,
    _meta: { kind: "set", elementType },
  }),

  list: <T extends CassandraSimpleType>(elementType: T): ListType<T> => ({
    // eslint-disable-next-line
    type: [] as any,
    operators: "=" as const,
    _meta: { kind: "list", elementType },
  }),

  tuple: <T extends readonly CassandraSimpleType[]>(
    ...types: T
  ): TupleType<T> => ({
    // eslint-disable-next-line
    type: [] as any,
    operators: "=" as const,
    _meta: { kind: "tuple", types },
  }),

  frozen: <T extends BaseCollectionType>(innerType: T): FrozenType<T> => ({
    ...innerType,
    _meta: { ...innerType._meta, frozen: true },
  }),
};

// Map Cassandra types to TypeScript types
export type Operators = {
  EQ: "=";
  GT: ">";
  LT: "<";
  GTE: ">=";
  LTE: "<=";
  IN: "IN";
};

export type CassandraTypeMap = {
  UUID: { type: string; operators: Operators["EQ"] };
  TEXT: {
    type: string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  TIMESTAMP: {
    type: Date | number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  ASCII: {
    type: string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  BIGINT: {
    type: bigint | number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  DATE: {
    type: Date | string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  DECIMAL: {
    type: number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  DOUBLE: {
    type: number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  FLOAT: {
    type: number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  INET: {
    type: string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  INT: {
    type: number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  SMALLINT: {
    type: number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  TIME: {
    type: Date | string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  TIMEUUID: {
    type: string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  TINYINT: {
    type: number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  VARCHAR: {
    type: string;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  VARINT: {
    type: bigint | number;
    operators: Operators["EQ" | "GT" | "LT" | "LTE" | "GTE" | "IN"];
  };
  BLOB: { type: Buffer | Uint8Array; operators: Operators["EQ" | "IN"] };
  BOOLEAN: { type: boolean; operators: Operators["EQ" | "IN"] };
  COUNTER: { type: number; operators: Operators["EQ" | "IN"] };
};

// map, set, list, tuple, and frozen are removed because they are not simple types
export const cassandraTypes = [
  "uuid",
  "text",
  "timestamp",
  "ascii",
  "bigint",
  "blob",
  "boolean",
  "counter",
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

export type CassandraTypeLower = Lowercase<keyof CassandraTypeMap>;
export type CassandraTypeUpper = keyof CassandraTypeMap;

export type CassandraSimpleType = CassandraTypeLower | CassandraTypeUpper;

// Extended type including primitives and collections
export type ExtendedCassandraType =
  | CassandraSimpleType
  | CollectionTypeDefinition;

export const c = cassandraTypes.reduce(
  (previous, current) => ({ ...previous, [current]: current.toUpperCase() }),
  {},
) as {
  [T in CassandraTypeLower]: Uppercase<T>;
};

export type ColumnDefinitions = Record<string, ExtendedCassandraType>;

export interface TableSchema<T extends ColumnDefinitions = ColumnDefinitions> {
  columns: T;
  // Mirrors the syntax of primary keys.
  // We won't be supporting inline primary key to prevent collision between the inline and the table-level ones.
  primaryKey?: [keyof T | [keyof T, ...(keyof T)[]], ...(keyof T)[]];
}

export type WithOption = { type: string; value: string };

// Helper to extract the actual TypeScript type
export type ExtractType<T> = T extends { type: infer U }
  ? U
  : T extends CassandraTypeUpper
    ? CassandraTypeMap[T]["type"]
    : never;

// Updated SchemaToType
export type SchemaToType<T extends ColumnDefinitions> = {
  [K in keyof T]: ExtractType<T[K]>;
};

// Extract all primary key columns
export type ExtractPrimaryKeys<PK> = PK extends [infer First, ...infer Rest]
  ? (First extends unknown[] ? First[number] : First) | Rest[number]
  : never;

export type ExtractPartitionKeys<PK> = PK extends readonly [
  infer First,
  ...unknown[],
]
  ? First extends readonly (infer K)[]
    ? K
    : First
  : never;

export type InsertValues<
  T extends ColumnDefinitions,
  Schema extends TableSchema<T>,
> = Schema["primaryKey"] extends undefined
  ? Partial<SchemaToType<T>> // No primary key = all fields optional
  : NonNullable<Schema["primaryKey"]> extends readonly [
        // eslint-disable-next-line
        infer _PK,
        // eslint-disable-next-line
        ...infer _Rest,
      ]
    ? Required<
        Pick<
          SchemaToType<T>,
          Extract<ExtractPrimaryKeys<Schema["primaryKey"]>, keyof T>
        >
      > &
        Partial<
          Omit<
            SchemaToType<T>,
            Extract<ExtractPrimaryKeys<Schema["primaryKey"]>, keyof T>
          >
        >
    : SchemaToType<T>; // Fallback: all fields required;

export type SelectColumns<
  T extends ColumnDefinitions,
  Schema extends TableSchema<T>,
> = keyof Schema["columns"];

export type TypeToOperator<T extends keyof CassandraTypeMap> =
  CassandraTypeMap[T]["operators"];

// Helper type to extract clustering keys (everything after partition keys)
type ExtractClusteringKeys<PK> = PK extends readonly [unknown, ...infer Rest]
  ? Rest[number]
  : never;

// Type for partition key conditions (always equality)
export type PartitionConditions<
  T extends ColumnDefinitions,
  Schema extends TableSchema<T>,
> = {
  [K in Extract<
    ExtractPartitionKeys<NonNullable<Schema["primaryKey"]>>,
    keyof SchemaToType<T>
  >]: [K, "=", SchemaToType<T>[K]] | [K, "IN", SchemaToType<T>[K][]];
}[Extract<
  ExtractPartitionKeys<NonNullable<Schema["primaryKey"]>>,
  keyof SchemaToType<T>
>];

// Type for clustering key conditions (supports all operators)
export type ClusteringConditions<
  T extends ColumnDefinitions,
  Schema extends TableSchema<T>,
> = {
  [K in Extract<
    ExtractClusteringKeys<NonNullable<Schema["primaryKey"]>>,
    keyof SchemaToType<T>
  >]:
    | [K, "IN", SchemaToType<T>[K][]]
    | [
        K,
        Exclude<TypeToOperator<Schema["columns"][K]>, "IN">,
        SchemaToType<T>[K],
      ];
}[Extract<
  ExtractClusteringKeys<NonNullable<Schema["primaryKey"]>>,
  keyof SchemaToType<T>
>];

// Main where options type
export type SelectWhereOptions<
  T extends ColumnDefinitions,
  Schema extends TableSchema<T>,
> = Schema["primaryKey"] extends undefined
  ? never // No primary key at all
  : ExtractClusteringKeys<NonNullable<Schema["primaryKey"]>> extends never
    ? {
        // Only partition keys exist
        partition: [
          PartitionConditions<T, Schema>,
          ...PartitionConditions<T, Schema>[],
        ];
        clustering?: never;
      }
    : {
        // Both partition and clustering keys exist
        partition: [
          PartitionConditions<T, Schema>,
          ...PartitionConditions<T, Schema>[],
        ];
        clustering?: [
          ClusteringConditions<T, Schema>,
          ...ClusteringConditions<T, Schema>[],
        ];
      };

import type { types } from "cassandra-driver";

export type CassandraResultType<Row> = types.ResultSet & {
  rows: Row extends undefined ? undefined : Row[];
  first: Row extends undefined ? never : () => Row;
};
