import { CachingWithOptionMeta, WithOption } from "./types";

export function caching<
  O extends {
    keys: "all" | "none";
    rowsPerPartition?: "all" | "none" | number;
  },
>(options: O): WithOption<O, "caching", CachingWithOptionMeta<O>> {
  return {
    cql: `CACHING = {'keys': '${options.keys.toUpperCase()}','row_per_partition': '${options.rowsPerPartition ? (typeof options.rowsPerPartition === "number" ? options.rowsPerPartition : options.rowsPerPartition.toUpperCase()) : "NONE"}'}`,
    _meta: { kind: "caching", ts: undefined as unknown as O },
  };
}
