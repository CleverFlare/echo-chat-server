import { BaseMeta, CqlKind, CqlType } from "@/cql/cql-types/types";
import { ContainsAll, TableContext } from "@/cql/types";
import { UnionToTuple } from "type-fest";

export type Update =
  | { kind: "replace"; column: string; value: unknown }
  | { kind: "append"; column: string; value: unknown }
  | { kind: "prepend"; column: string; value: unknown }
  | { kind: "remove"; column: string; value: unknown }
  | { kind: "setField"; column: string; field: string; value: unknown }
  | { kind: "setIndex"; column: string; key: string; value: unknown };

export interface UpdateBuilderInput {
  updates: readonly Update[];
  whereConditions: readonly [string, string, unknown][];
  ifConditions?: readonly [string, string, unknown][];
  ifExists?: boolean;
  ttl?: number;
  timestamp?: number;
}

export type HasFullPrimaryKey<
  WhereConditions extends readonly [string, string, unknown][] | undefined,
  TContext extends TableContext,
> = WhereConditions extends readonly [string, string, unknown][]
  ? ContainsAll<
      UnionToTuple<WhereConditions[number][0]>,
      [...TContext["partitionKeys"], ...TContext["clusteringKeys"]]
    >
  : false;

export type ColumnsOfKind<TContext extends TableContext, K extends CqlKind> = {
  [C in keyof TContext["columns"]]: TContext["columns"][C] extends CqlType<
    // eslint-disable-next-line
    any,
    K,
    // eslint-disable-next-line
    BaseMeta<any, K>
  >
    ? C
    : never;
}[keyof TContext["columns"]] &
  string;

export type ListColumn<TContext extends TableContext> = ColumnsOfKind<
  TContext,
  "list"
>;

export type SetColumn<TContext extends TableContext> = ColumnsOfKind<
  TContext,
  "set"
>;

export type MapColumn<TContext extends TableContext> = ColumnsOfKind<
  TContext,
  "map"
>;

export type UdtColumn<TContext extends TableContext> = ColumnsOfKind<
  TContext,
  "udt"
>;

export type UpdateValues<TContext extends TableContext> = {
  [K in keyof TContext["columns"]]?: TContext["columns"][K]["_meta"]["ts"];
};
