import { TypeDef, InferType } from "./metadata";

/**
 * Table schema definition types
 */

// Helper for camelCase conversion
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

// Table schema structure
export type TableSchema<
  S extends Record<string, TypeDef> = Record<string, TypeDef>,
> = {
  columns: S;
  primaryKey?: readonly [keyof S | readonly (keyof S)[], ...(keyof S)[]];
};

// Convert schema columns to TypeScript type (with camelCase keys)
export type SchemaToType<S extends Record<string, TypeDef>> = {
  [K in keyof S as K extends string ? CamelCase<K> : K]: InferType<S[K]>;
};

// WITH clause option
export type WithOption = {
  type: string;
  value: string;
};

// Extract all primary key columns (flattened)
export type ExtractPrimaryKeys<PK> = PK extends readonly [
  infer First,
  ...infer Rest,
]
  ? (First extends readonly unknown[] ? First[number] : First) | Rest[number]
  : never;

// Extract only partition keys
export type ExtractPartitionKeys<PK> = PK extends readonly [
  infer First,
  ...unknown[],
]
  ? First extends readonly (infer K)[]
    ? K
    : First
  : never;

// Extract only clustering keys
export type ExtractClusteringKeys<PK> = PK extends readonly [
  unknown,
  ...infer Rest,
]
  ? Rest[number]
  : never;

// INSERT values type - primary keys required, others optional
export type InsertValues<
  S extends Record<string, TypeDef>,
  Schema extends TableSchema<S>,
> = Schema["primaryKey"] extends undefined
  ? Partial<SchemaToType<S>> // No primary key = all optional
  : NonNullable<Schema["primaryKey"]> extends readonly [unknown, ...unknown[]]
    ? Required<
        Pick<
          SchemaToType<S>,
          Extract<ExtractPrimaryKeys<Schema["primaryKey"]>, keyof S>
        >
      > &
        Partial<
          Omit<
            SchemaToType<S>,
            Extract<ExtractPrimaryKeys<Schema["primaryKey"]>, keyof S>
          >
        >
    : SchemaToType<S>; // Fallback
