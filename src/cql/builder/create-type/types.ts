import { Schema } from "@/cql/types";

export type CreateTypeBuilderInput = {
  keyspace?: string;
  type: string;
  ifNotExists?: boolean;
  schema: Schema;
};
