export type CqlKind =
  | "scalar"
  | "list"
  | "map"
  | "frozen"
  | "set"
  | "tuple"
  | "udt";

export type Operators<
  P extends readonly string[] | null = readonly string[] | null,
  C extends readonly string[] | null = readonly string[] | null,
> = {
  clustering: C;
  partition: P;
};

export interface BaseMeta<
  TTs,
  Kind extends CqlKind,
  TOps extends Operators = Operators,
> {
  kind: Kind;
  ts: TTs;
  operators?: TOps;
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

export type ScalarMeta<TTs, TOps extends Operators = Operators> = BaseMeta<
  TTs,
  "scalar",
  TOps
>;

export type ListMeta<
  // eslint-disable-next-line
  E extends CqlType<any, any, any>,
  TOps extends Operators = Operators,
> = BaseMeta<Array<InferTs<E>>, "list", TOps>;

export interface UdtMeta<
  // eslint-disable-next-line
  Schema extends Record<string, CqlType<any, any, any>>,
  TOps extends Operators = Operators,
> extends BaseMeta<{ [K in keyof Schema]: InferTs<Schema[K]> }, "udt", TOps> {
  name: string;
  schema: Schema;
}

export type SetMeta<
  // eslint-disable-next-line
  E extends CqlType<any, any, any>,
  TOps extends Operators = Operators,
> = BaseMeta<Array<InferTs<E>>, "set", TOps>;

// eslint-disable-next-line
type TupleTs<E extends readonly CqlType<any, any, any>[]> = {
  [K in keyof E]: InferTs<E[K]>;
};

export interface TupleMeta<
  // eslint-disable-next-line
  E extends readonly CqlType<any, any, any>[],
  TOps extends Operators = Operators,
> extends BaseMeta<TupleTs<E>, "tuple", TOps> {
  elements: E;
}

export interface FrozenMeta<
  // eslint-disable-next-line
  E extends CqlType<any, any, any>,
  TOps extends Operators = Operators,
> extends BaseMeta<InferTs<E>, "frozen", TOps> {
  element: E;
}

export type ValidMapKey =
  // eslint-disable-next-line
  | CqlType<any, "scalar", ScalarMeta<any, any>>
  // eslint-disable-next-line
  | CqlType<any, "frozen", FrozenMeta<any, any>>;

export interface MapMeta<
  K extends ValidMapKey,
  // eslint-disable-next-line
  V extends CqlType<any, any, any>,
  TOps extends Operators = Operators,
> extends BaseMeta<Map<InferTs<K>, InferTs<V>>, "map", TOps> {
  key: InferTs<K>;
  value: InferTs<V>;
}
