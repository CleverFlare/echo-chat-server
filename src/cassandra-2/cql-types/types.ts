export type CqlKind =
  | "scalar"
  | "list"
  | "map"
  | "frozen"
  | "set"
  | "tuple"
  | "udt";

export interface BaseMeta<TTs, Kind extends CqlKind> {
  kind: Kind;
  ts: TTs;
}

export interface CqlType<
  TTs,
  TKind extends CqlKind,
  TMeta extends BaseMeta<TTs, TKind>,
> {
  cql: string;
  _meta: TMeta;
}

// eslint-disable-next-line
export type InferTs<T extends CqlType<any, any, any>> = T["_meta"]["ts"];

export type ScalarMeta<TTs> = BaseMeta<TTs, "scalar">;

// eslint-disable-next-line
export interface ListMeta<E extends CqlType<any, any, any>> extends BaseMeta<
  Array<InferTs<E>>,
  "list"
> {}

export interface UdtMeta<
  // eslint-disable-next-line
  Schema extends Record<string, CqlType<any, any, any>>,
> extends BaseMeta<{ [K in keyof Schema]: InferTs<Schema[K]> }, "udt"> {
  name: string;
  schema: Schema;
}

// eslint-disable-next-line
export interface SetMeta<E extends CqlType<any, any, any>> extends BaseMeta<
  Array<InferTs<E>>,
  "set"
> {}

// eslint-disable-next-line
type TupleTs<E extends readonly CqlType<any, any, any>[]> = {
  [K in keyof E]: InferTs<E[K]>;
};

export interface TupleMeta<
  // eslint-disable-next-line
  E extends readonly CqlType<any, any, any>[],
> extends BaseMeta<TupleTs<E>, "tuple"> {
  elements: E;
}

// eslint-disable-next-line
export interface FrozenMeta<E extends CqlType<any, any, any>> extends BaseMeta<
  InferTs<E>,
  "frozen"
> {
  element: E;
}

export type ValidMapKey =
  // eslint-disable-next-line
  | CqlType<any, "scalar", ScalarMeta<any>>
  // eslint-disable-next-line
  | CqlType<any, "frozen", FrozenMeta<any>>;

export interface MapMeta<
  K extends ValidMapKey,
  // eslint-disable-next-line
  V extends CqlType<any, any, any>,
> extends BaseMeta<Map<InferTs<K>, InferTs<V>>, "map"> {
  key: InferTs<K>;
  value: InferTs<V>;
}
