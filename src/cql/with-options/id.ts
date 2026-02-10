import { ScalarWithOptionMeta, WithOption } from "./types";

export function id(
  value: string,
): WithOption<string, "id", ScalarWithOptionMeta<"id">> {
  return {
    cql: `ID = ${value}`,
    _meta: { kind: "id", ts: undefined as unknown as string },
  };
}
