import { Client } from "cassandra-driver";
import { DropTableBuilderInput } from "./types";
import { DropTableContext } from "./context";

export class DropTableBuilder<TState extends Partial<DropTableBuilderInput>> {
  #actual: TState;

  protected constructor(
    private client: Client,
    actual: TState,
  ) {
    this.#actual = actual;
  }

  static create(client: Client) {
    return new DropTableBuilder(client, {});
  }

  private clone<T extends Partial<DropTableBuilderInput>>(
    actual: T,
  ): DropTableBuilder<T> {
    return new DropTableBuilder(this.client, actual);
  }

  keyspace(
    this: DropTableBuilder<TState & { keyspace?: never }>,
    name: string,
  ) {
    return this.clone({ ...this.#actual, keyspace: name });
  }

  table(this: DropTableBuilder<TState & { table?: never }>, name: string) {
    return this.clone({ ...this.#actual, table: name });
  }

  ifExists(
    this: DropTableBuilder<TState & { ifExists?: never }>,
    option?: boolean,
  ) {
    return this.clone({ ...this.#actual, ifExists: option ?? true });
  }

  private buildCQL(this: DropTableBuilder<TState & DropTableBuilderInput>) {
    const parts = ["DROP", "TABLE"];

    if (this.#actual.ifExists) parts.push("IF EXISTS");

    if (!this.#actual.table) throw new Error("Table name is required");

    if (this.#actual.keyspace)
      parts.push(`"${this.#actual.keyspace}"."${this.#actual.table}"`);
    else parts.push(`"${this.#actual.table}"`);

    return parts.join(" ") + ";";
  }

  build<T extends TState & DropTableBuilderInput>(this: DropTableBuilder<T>) {
    const cql = this.buildCQL();
    return DropTableContext.create<T>(this.client, cql, this.#actual);
  }

  toCQL(this: DropTableBuilder<TState & DropTableBuilderInput>) {
    return this.buildCQL();
  }
}
