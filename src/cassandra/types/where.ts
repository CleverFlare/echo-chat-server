import { TypeDef } from "./metadata";
import {
  TableSchema,
  SchemaToType,
  ExtractPartitionKeys,
  ExtractClusteringKeys,
} from "./schema";

/**
 * WHERE clause type definitions
 */

// Partition key conditions (only = and IN allowed)
export type PartitionConditions<
  S extends Record<string, TypeDef>,
  Schema extends TableSchema<S>,
> = {
  [K in Extract<
    ExtractPartitionKeys<NonNullable<Schema["primaryKey"]>>,
    keyof SchemaToType<S>
  >]: [K, "=", SchemaToType<S>[K]] | [K, "IN", SchemaToType<S>[K][]];
}[Extract<
  ExtractPartitionKeys<NonNullable<Schema["primaryKey"]>>,
  keyof SchemaToType<S>
>];

// Clustering key conditions (all operators allowed based on type)
export type ClusteringConditions<
  S extends Record<string, TypeDef>,
  Schema extends TableSchema<S>,
> = {
  [K in Extract<
    ExtractClusteringKeys<NonNullable<Schema["primaryKey"]>>,
    keyof SchemaToType<S>
  >]:
    | [K, "=", SchemaToType<S>[K]]
    | [K, ">", SchemaToType<S>[K]]
    | [K, "<", SchemaToType<S>[K]]
    | [K, ">=", SchemaToType<S>[K]]
    | [K, "<=", SchemaToType<S>[K]]
    | [K, "IN", SchemaToType<S>[K][]];
}[Extract<
  ExtractClusteringKeys<NonNullable<Schema["primaryKey"]>>,
  keyof SchemaToType<S>
>];

// Complete WHERE options
export type WhereOptions<
  S extends Record<string, TypeDef>,
  Schema extends TableSchema<S>,
> = Schema["primaryKey"] extends undefined
  ? never
  : ExtractClusteringKeys<NonNullable<Schema["primaryKey"]>> extends never
    ? {
        partition: [
          PartitionConditions<S, Schema>,
          ...PartitionConditions<S, Schema>[],
        ];
        clustering?: never;
      }
    : {
        partition: [
          PartitionConditions<S, Schema>,
          ...PartitionConditions<S, Schema>[],
        ];
        clustering?: [
          ClusteringConditions<S, Schema>,
          ...ClusteringConditions<S, Schema>[],
        ];
      };
