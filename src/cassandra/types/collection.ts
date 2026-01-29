import { TypeDef, InferType } from "./metadata";

/**
 * Collection type constructors with proper recursion
 */

// Map constructor
export function map<K extends TypeDef, V extends TypeDef>(
  keyType: K,
  valueType: V,
): TypeDef<Map<InferType<K>, InferType<V>>> {
  return {
    _tsType: null as unknown as Map<InferType<K>, InferType<V>>,
    _metadata: {
      kind: "map",
      keyType: keyType._metadata,
      valueType: valueType._metadata,
    },
  };
}

// Set constructor
export function set<T extends TypeDef>(
  elementType: T,
): TypeDef<Set<InferType<T>>> {
  return {
    _tsType: null as unknown as Set<InferType<T>>,
    _metadata: {
      kind: "set",
      elementType: elementType._metadata,
    },
  };
}

// List constructor
export function list<T extends TypeDef>(
  elementType: T,
): TypeDef<Array<InferType<T>>> {
  return {
    _tsType: null as unknown as Array<InferType<T>>,
    _metadata: {
      kind: "list",
      elementType: elementType._metadata,
    },
  };
}

// Tuple constructor
export function tuple<T extends readonly TypeDef[]>(
  ...elementTypes: T
): TypeDef<{ [K in keyof T]: InferType<T[K]> }> {
  return {
    _tsType: null as unknown as { [K in keyof T]: InferType<T[K]> },
    _metadata: {
      kind: "tuple",
      types: elementTypes.map((t) => t._metadata),
    },
  };
}

// Frozen wrapper
export function frozen<T extends TypeDef>(innerType: T): TypeDef<InferType<T>> {
  return {
    _tsType: innerType._tsType,
    _metadata: {
      kind: "frozen",
      inner: innerType._metadata,
    },
  };
}

export const collection = {
  map,
  set,
  list,
  tuple,
  frozen,
} as const;
