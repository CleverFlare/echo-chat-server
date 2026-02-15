import { Client } from "cassandra-driver";
import { snakeCase } from "change-case";
import { SnakeCase, SnakeCasedProperties } from "type-fest";
import { CreateTypeBuilderInput } from "./types";
import { CreateTypeContext } from "./context";
import { Schema } from "@/cql/types";
import { CreateTableContext } from "../create-table/context";

export class CreateTypeBuilder<
  const TState extends Partial<CreateTypeBuilderInput>,
> {
  #actual: TState;

  protected constructor(
    private client: Client,
    actual: TState,
  ) {
    this.#actual = actual;
  }

  static create(client: Client) {
    return new CreateTypeBuilder(client, {});
  }

  private clone<T extends Partial<CreateTypeBuilderInput>>(
    actual: T,
  ): CreateTypeBuilder<T> {
    return new CreateTypeBuilder(this.client, actual);
  }

  keyspace<const Keyspace extends string>(
    this: CreateTypeBuilder<TState & { keyspace?: never }>,
    name: Keyspace,
  ): CreateTypeBuilder<TState & { keyspace: SnakeCase<Keyspace> }> {
    return this.clone({
      ...this.#actual,
      keyspace: snakeCase(name) as SnakeCase<Keyspace>,
    });
  }

  type<const Type extends string>(
    this: CreateTypeBuilder<TState & { type?: never }>,
    name: Type,
  ): CreateTypeBuilder<TState & { type: SnakeCase<Type> }> {
    return this.clone({
      ...this.#actual,
      type: snakeCase(name) as SnakeCase<Type>,
    });
  }

  // Overloads for all cases
  ifNotExists(): CreateTypeBuilder<TState & { ifNotExists: true }>;

  ifNotExists(option: true): CreateTypeBuilder<TState & { ifNotExists: true }>;

  ifNotExists(
    option: false,
  ): CreateTypeBuilder<TState & { ifNotExists: false }>;

  ifNotExists(
    option: boolean,
  ): CreateTypeBuilder<TState & { ifNotExists: boolean }>;

  // Single implementation
  ifNotExists(option?: boolean) {
    return this.clone({
      ...this.#actual,
      ifNotExists: option ?? true,
    });
  }

  schema<const T extends Schema>(
    this: CreateTypeBuilder<TState & { schema?: never }>,
    schema: T,
  ) {
    type SnakeCasedSchema = SnakeCasedProperties<T>;

    const snakeCasedSchema = Object.entries(schema).reduce(
      (prev, [key, value]) => ({ ...prev, [snakeCase(key)]: value }),
      {},
    ) as SnakeCasedSchema;

    return this.clone({ ...this.#actual, schema: snakeCasedSchema });
  }

  private assembleSchema(
    this: CreateTypeBuilder<TState & CreateTypeBuilderInput>,
  ) {
    const columns = Object.entries(this.#actual.schema).map(
      ([key, value]) => `${key} ${value.cql}`,
    );

    return `(\n${columns.join(",\n")})`;
  }

  private buildCQL(this: CreateTypeBuilder<TState & CreateTypeBuilderInput>) {
    const parts = ["CREATE", "TYPE"];

    if (!this.#actual.type) throw new Error("Type name is required");

    if (this.#actual.keyspace)
      parts.push(`${this.#actual.keyspace}.${this.#actual.type}`);
    else parts.push(this.#actual.type);

    if (this.#actual.ifNotExists) parts.push("IF NOT EXISTS");

    const formattedSchema = this.assembleSchema();

    parts.push(formattedSchema);

    return parts.join(" ") + ";";
  }

  build<T extends TState & CreateTypeBuilderInput>(this: CreateTypeBuilder<T>) {
    const cql = this.buildCQL();
    return CreateTypeContext.create<T>(this.client, cql, this.#actual);
  }

  toCQL(this: CreateTypeBuilder<TState & CreateTypeBuilderInput>) {
    return this.buildCQL();
  }
}
