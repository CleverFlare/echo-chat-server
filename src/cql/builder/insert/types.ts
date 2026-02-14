import { TableContext } from "@/cql/types";

export interface InsertBuilderInput {
  values: Record<string, unknown>;
  ifNotExists?: boolean;
  ttl?: number;
  timestamp?: number;
}

export type InsertValues<TContext extends TableContext> = {
  [K in keyof TContext["columns"]]?: TContext["columns"][K]["_meta"]["ts"];
};
