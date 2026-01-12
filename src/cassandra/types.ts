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

export const c = cassandraTypes.reduce(
  (previous, current) => ({ ...previous, [current]: current.toUpperCase() }),
  {},
) as {
  [T in CassandraTypeLower]: Uppercase<T>;
};

export type ColumnDefinitions = Record<string, CassandraTypeUpper>;

export interface TableSchema<T extends ColumnDefinitions = ColumnDefinitions> {
  columns: T;
  // Mirrors the syntax of primary keys.
  // We won't be supporting inline primary key to prevent collision between the inline and the table-level ones.
  primaryKey?: [
    (
      | keyof this["columns"]
      | [keyof this["columns"], ...(keyof this["columns"])[]]
    ),
    ...(keyof this["columns"])[],
  ];
}

export type WithOption = { type: string; value: string };

// Convert schema to TypeScript types
export type SchemaToType<T extends ColumnDefinitions> = {
  [K in keyof T]: T[K] extends keyof CassandraTypeMap
    ? CassandraTypeMap[T[K]]["type"]
    : never;
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
