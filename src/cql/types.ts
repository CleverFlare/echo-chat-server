import { CqlType } from "@/cql/cql-types/types";
import { WithOption } from "@/cql/with-options/types";
import { CreateTableContext } from "./builder/create-table/context";

// eslint-disable-next-line
export type Schema = Record<string, CqlType<any, any, any>>;

export type TableContext = {
  keyspace?: string;
  table: string;
  ifNotExists?: boolean;
  columns: Schema;
  partitionKeys: readonly string[];
  clusteringKeys: readonly string[];
  clusteringOrderBy?: Record<string, "asc" | "desc">;
  // eslint-disable-next-line
  withOptions?: readonly WithOption<any, any, any>[];
};

export type TablesCollection = Record<string, TableContext>;

export type GetCqlTypeOperators<
  TColumn extends string,
  TContext extends TableContext,
> = TColumn extends TContext["partitionKeys"][number]
  ? NonNullable<
      TContext["columns"][TColumn]["_meta"]["operators"]
    >["partition"][number]
  : TColumn extends TContext["clusteringKeys"][number]
    ? NonNullable<
        TContext["columns"][TColumn]["_meta"]["operators"]
      >["clustering"][number]
    : never;

export type ContainsAll<
  T extends readonly unknown[],
  U extends readonly unknown[],
> = U[number] extends T[number] ? true : false;

export type InferSchema<Context extends CreateTableContext<TableContext>> = {
  [K in keyof Context["context"]["columns"]]: NonNullable<
    Context["context"]["columns"][K]["_meta"]
  >["ts"];
};
