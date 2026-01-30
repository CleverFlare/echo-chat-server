import { CqlType } from "@/cassandra-2/cql-types/types";

// eslint-disable-next-line
export type ColumnsSchema = Record<string, CqlType<any, any, any>>;
