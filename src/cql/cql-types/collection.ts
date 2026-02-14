import { snakeCase } from "change-case";
import {
  CqlType,
  FrozenMeta,
  InferTs,
  ListMeta,
  MapMeta,
  SetMeta,
  TupleMeta,
  UdtMeta,
  ValidMapKey,
} from "./types";
import type { SnakeCasedProperties } from "type-fest";

// eslint-disable-next-line
export function list<E extends CqlType<any, any, any>>(element: E) {
  return {
    cql: `LIST<${element.cql}>`,
    _meta: {
      kind: "list" as const,
      ts: undefined as unknown as Array<InferTs<E>>,
      operators: {
        partition: null,
        clustering: ["=", "<", ">", "<=", ">=", "in", "contains"],
      } as const,
    },
  } satisfies CqlType<Array<InferTs<E>>, "list", ListMeta<E>>;
}

// eslint-disable-next-line
export function set<E extends CqlType<any, any, any>>(element: E) {
  return {
    cql: `SET<${element.cql}>`,
    _meta: {
      kind: "set" as const,
      ts: undefined as unknown as Array<InferTs<E>>,
      operators: {
        partition: null,
        clustering: ["=", "<", ">", "<=", ">=", "in", "contains"],
      } as const,
    },
  } satisfies CqlType<Array<InferTs<E>>, "set", SetMeta<E>>;
}

export function map<
  K extends ValidMapKey,
  // eslint-disable-next-line
  V extends CqlType<any, any, any>,
>(key: K, value: V) {
  return {
    cql: `MAP<${key.cql}, ${value.cql}>`,
    _meta: {
      kind: "map" as const,
      ts: undefined as unknown as Map<InferTs<K>, InferTs<V>>,
      key: undefined as unknown as InferTs<K>,
      value: undefined as unknown as InferTs<V>,
      operators: {
        partition: null,
        clustering: ["=", "<", ">", "<=", ">=", "in", "contains"],
      } as const,
    },
  } satisfies CqlType<Map<InferTs<K>, InferTs<V>>, "map", MapMeta<K, V>>;
}

// eslint-disable-next-line
export function tuple<E extends readonly CqlType<any, any, any>[]>(
  ...elements: E
) {
  return {
    cql: `TUPLE<${elements.map((e) => e.cql).join(", ")}>`,
    _meta: {
      kind: "tuple" as const,
      ts: undefined as unknown as {
        [K in keyof E]: InferTs<E[K]>;
      },
      elements,
      operators: {
        partition: null,
        clustering: ["=", "<", ">", "<=", ">=", "in", "contains"],
      } as const,
    },
  } satisfies CqlType<{ [K in keyof E]: InferTs<E[K]> }, "tuple", TupleMeta<E>>;
}

// eslint-disable-next-line
export function frozen<E extends CqlType<any, any, any>>(element: E) {
  return {
    cql: `FROZEN<${element.cql}>`,
    _meta: {
      kind: "frozen" as const,
      ts: undefined as unknown as InferTs<E>,
      element,
      operators: {
        partition: ["=", "in"],
        clustering: ["=", "<", ">", "<=", ">=", "in", "not contains"],
      } as const,
    },
  } satisfies CqlType<InferTs<E>, "frozen", FrozenMeta<E>>;
}
