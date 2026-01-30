import { CompactStorageWithOptionMeta, WithOption } from "./types";

export function compactStorage(): WithOption<
  boolean,
  "compact storage",
  CompactStorageWithOptionMeta
> {
  return {
    cql: `COMPACT STORAGE`,
    _meta: { kind: "compact storage", ts: undefined as unknown as boolean },
  };
}
