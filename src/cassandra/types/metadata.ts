/**
 * Core metadata system - the foundation of the type system
 */

// Base metadata that all types carry
export type TypeMetadata =
  | PrimitiveMetadata
  | MapMetadata
  | SetMetadata
  | ListMetadata
  | TupleMetadata
  | UDTMetadata
  | FrozenMetadata;

export type PrimitiveMetadata = {
  kind: "primitive";
  cqlType: string;
};

export type MapMetadata = {
  kind: "map";
  keyType: TypeMetadata;
  valueType: TypeMetadata;
};

export type SetMetadata = {
  kind: "set";
  elementType: TypeMetadata;
};

export type ListMetadata = {
  kind: "list";
  elementType: TypeMetadata;
};

export type TupleMetadata = {
  kind: "tuple";
  types: readonly TypeMetadata[];
};

export type UDTMetadata = {
  kind: "udt";
  name: string;
  fields: Record<string, TypeMetadata>;
};

export type FrozenMetadata = {
  kind: "frozen";
  inner: TypeMetadata;
};

// Core type definition that carries both TS type and metadata
// eslint-disable-next-line
export type TypeDef<TSType = any> = {
  readonly _tsType: TSType;
  readonly _metadata: TypeMetadata;
};

// Extract TypeScript type from TypeDef
export type InferType<T> = T extends TypeDef<infer U> ? U : never;

// Extract metadata from TypeDef
// eslint-disable-next-line
export type InferMetadata<T> = T extends TypeDef<any> ? T["_metadata"] : never;
