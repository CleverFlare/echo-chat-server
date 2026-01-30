export type WithOptionKind = "caching" | "compact storage" | "id";

export interface BaseWithOptionMeta<TTs, Kind extends WithOptionKind> {
  kind: Kind;
  ts: TTs;
}

export type WithOption<
  TTs,
  TKind extends WithOptionKind,
  TMeta extends BaseWithOptionMeta<TTs, TKind>,
> = {
  cql: string;
  _meta: TMeta;
};

// eslint-disable-next-line
export type InferTs<T extends WithOption<any, any, any>> = T["_meta"]["ts"];

export type ScalarWithOptionMeta<N extends WithOptionKind> = BaseWithOptionMeta<
  string,
  N
>;

export type CachingWithOptionMeta<E> = BaseWithOptionMeta<E, "caching">;

export type CompactStorageWithOptionMeta = BaseWithOptionMeta<
  boolean,
  "compact storage"
>;
