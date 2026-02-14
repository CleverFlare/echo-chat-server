import { Client } from "cassandra-driver";
import { DropTypeBuilderInput } from "./types";
import { DropTypeContext } from "./context";

export class DropTypeBuilder<TState extends Partial<DropTypeBuilderInput>> {
  #actual: TState;

  protected constructor(
    private client: Client,
    actual: TState,
  ) {
    this.#actual = actual;
  }

  static create(client: Client) {
    return new DropTypeBuilder(client, {});
  }

  private clone<T extends Partial<DropTypeBuilderInput>>(
    actual: T,
  ): DropTypeBuilder<T> {
    return new DropTypeBuilder(this.client, actual);
  }

  keyspace(this: DropTypeBuilder<TState & { keyspace?: never }>, name: string) {
    return this.clone({ ...this.#actual, keyspace: name });
  }

  type(this: DropTypeBuilder<TState & { type?: never }>, name: string) {
    return this.clone({ ...this.#actual, type: name });
  }

  ifExists(
    this: DropTypeBuilder<TState & { ifExists?: never }>,
    option?: boolean,
  ) {
    return this.clone({ ...this.#actual, ifExists: option ?? true });
  }

  private buildCQL(this: DropTypeBuilder<TState & DropTypeBuilderInput>) {
    const parts = ["DROP", "TYPE"];

    if (this.#actual.ifExists) parts.push("IF EXISTS");

    if (!this.#actual.type) throw new Error("Type name is required");

    if (this.#actual.keyspace)
      parts.push(`${this.#actual.keyspace}.${this.#actual.type}`);
    else parts.push(this.#actual.type);

    return parts.join(" ") + ";";
  }

  build<T extends TState & DropTypeBuilderInput>(this: DropTypeBuilder<T>) {
    const cql = this.buildCQL();
    return DropTypeContext.create<T>(this.client, cql, this.#actual);
  }

  toCQL(this: DropTypeBuilder<TState & DropTypeBuilderInput>) {
    return this.buildCQL();
  }
}
