import { TypeDef, InferType, TypeMetadata } from "./metadata";
import { Client } from "cassandra-driver";
import { CreateTypeBuilder } from "../builders/create-type";

/**
 * User-Defined Type (UDT) system
 */

export type UDTSchema = Record<string, TypeDef>;

// Helper type for camelCase conversion
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>;

// Convert UDT schema to TypeScript type
type UDTToType<S extends UDTSchema> = {
  [K in keyof S as K extends string ? CamelCase<K> : K]: InferType<S[K]>;
};

export class UDTDefinition<S extends UDTSchema> {
  private readonly typeDef: TypeDef<UDTToType<S>>;

  constructor(
    public readonly name: string,
    public readonly schema: S,
  ) {
    // Build metadata from schema
    const fields: Record<string, TypeMetadata> = {};
    for (const [key, typeDef] of Object.entries(schema)) {
      fields[key] = typeDef._metadata;
    }

    this.typeDef = {
      _tsType: null as unknown as UDTToType<S>,
      _metadata: {
        kind: "udt",
        name,
        fields,
      },
    };
  }

  /**
   * Create the UDT in Cassandra
   */
  async create(client: Client, keyspace?: string): Promise<void> {
    await new CreateTypeBuilder(client)
      .type(this.name, keyspace)
      .ifNotExists()
      .definitions(this.schema)
      .build()
      .execute();
  }

  /**
   * Get a reference to this UDT for use in schemas
   */
  ref(): TypeDef<UDTToType<S>> {
    return this.typeDef;
  }
}

/**
 * Define a User-Defined Type
 */
export function defineUDT<S extends UDTSchema>(
  name: string,
  schema: S,
): UDTDefinition<S> {
  return new UDTDefinition(name, schema);
}
