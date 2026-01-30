import { CqlType } from "@/cassandra-2/cql-types/types";

// eslint-disable-next-line
export type Schema = Record<string, CqlType<any, any, any>>;
