import { CqlType } from "@/cassandra-2/cql-types/types";
import { WithOption } from "@/cassandra-2/with-options/types";

// eslint-disable-next-line
export type Schema = Record<string, CqlType<any, any, any>>;

export type CreateTableBuilderInput = {
  keyspace?: string;
  table: string;
  ifNotExists?: boolean;
  columns: Schema;
  primaryKey: [string | string[], ...string[]];
  clusteringOrderBy?: Record<string, "asc" | "desc">;
  // eslint-disable-next-line
  withOptions?: WithOption<any, any, any>[];
};

export type CreateTableBuilderGeneric = Partial<CreateTableBuilderInput>;
