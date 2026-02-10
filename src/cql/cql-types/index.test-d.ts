import { expectType, expectError } from "tsd";
import { types } from "./scalar";
import { list, map, tuple, udt, frozen, set } from "./collection";
import type { CqlType, ScalarMeta } from "./types";

/* ---------- Scalars ---------- */

expectType<CqlType<string, "scalar", ScalarMeta<string>>>(types.text);
expectType<string>(types.text._meta.ts);

/* ---------- List ---------- */

const listOfText = list(types.text);
expectType<string[]>(listOfText._meta.ts);

/* ---------- Set ---------- */

const setOfInt = set(types.int);
expectType<number[]>(setOfInt._meta.ts);

/* ---------- Map ---------- */

const mapTextToInt = map(types.text, types.int);
expectType<Map<string, number>>(mapTextToInt._meta.ts);

/* ---------- Tuple ---------- */

const tupleType = tuple(types.text, types.int, types.uuid);
expectType<[string, number, string]>(tupleType._meta.ts);

/* ---------- UDT ---------- */

const user = udt("user", {
  id: types.uuid,
  name: types.text,
  age: types.int,
});

expectType<{
  id: string;
  name: string;
  age: number;
}>(user._meta.ts);

/* ---------- Frozen ---------- */

const frozenUser = frozen(user);
expectType<{
  id: string;
  name: string;
  age: number;
}>(frozenUser._meta.ts);

/* ---------- Illegal constructions ---------- */

// Map key must be scalar or frozen (if you enforced this)
expectError(map(list(types.text), types.int));
