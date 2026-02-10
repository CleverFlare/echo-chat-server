import { CqlType } from "@/cql/cql-types/types";
import { WithOption } from "@/cql/with-options/types";

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
  withOptions?: WithOption<any, any, any>[];
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
