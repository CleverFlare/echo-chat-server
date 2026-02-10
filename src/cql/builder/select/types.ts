import { TableContext } from "@/cql/types";
import { SelectBuilder } from "./builder";

export type SelectInput = {
  columns: readonly string[];
  whereConditions?: readonly [string, string, unknown][];
};

export type ExtractPartitionKeys<
  T extends readonly [string, string, unknown][],
> = {
  [K in keyof T]: T[K] extends readonly [infer First, string, unknown]
    ? First
    : never;
};

export type ContainsAll<
  T extends readonly unknown[],
  U extends readonly unknown[],
> = U[number] extends T[number] ? true : false;

export type HasAllPartitionKeys<
  T extends SelectInput["whereConditions"],
  C extends readonly string[],
> = T extends readonly [string, string, unknown][]
  ? ContainsAll<ExtractPartitionKeys<T>, C>
  : false;

export type SelectableColumn<C> = C extends TableContext
  ? keyof C["columns"]
  : string;

export type ValidatePartitionKeys<
  TState extends Partial<SelectInput>,
  TContext extends TableContext,
> = TState["whereConditions"] extends readonly [string, string, unknown][]
  ? HasAllPartitionKeys<
      TState["whereConditions"],
      TContext["partitionKeys"]
    > extends true
    ? SelectBuilder<TState & SelectInput, TContext & { table: string }>
    : never
  : SelectBuilder<TState & SelectInput, TContext & { table: string }>;

type WhereCondition<C extends string, O extends string, V> = [C, O, V];

export type AppendWhereCondition<
  TState extends Partial<SelectInput>,
  C extends string,
  O extends string,
  V,
> = {
  whereConditions: TState["whereConditions"] extends never
    ? [WhereCondition<C, O, V>]
    : readonly [
        WhereCondition<C, O, V>,
        ...(TState["whereConditions"] extends readonly [
          string,
          string,
          unknown,
        ][]
          ? TState["whereConditions"]
          : []),
      ];
  columns: TState["columns"];
};

export type SelectResult<
  Context extends TableContext,
  Columns extends SelectInput["columns"],
> = {
  [K in Exclude<
    keyof Context["columns"],
    Columns
  >]: Context["columns"][K]["_meta"]["ts"];
}[];
