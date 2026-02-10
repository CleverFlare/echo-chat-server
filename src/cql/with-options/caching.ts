import { CachingWithOptionMeta, WithOption } from "./types";

export function caching<
  O extends { keys: "all" | "none"; rowsPerPartition: "all" | "none" | number },
>(options: O): WithOption<O, "caching", CachingWithOptionMeta<O>> {
  return {
    cql: `CACHING = ${JSON.stringify(options)}`,
    _meta: { kind: "caching", ts: undefined as unknown as O },
  };
}
