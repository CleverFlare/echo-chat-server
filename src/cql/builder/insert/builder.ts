import { Client } from "cassandra-driver";
import { TableContext } from "@/cql/types";
import { CreateTableContext } from "../create-table/context";
import { InsertBuilderInput, InsertValues } from "./types";
import { InsertContext } from "./context";

export class InsertBuilder<
  TState extends Partial<InsertBuilderInput>,
  TContext extends TableContext,
> {
  #context: TContext;
  #actual: TState;

  private constructor(
    private client: Client,
    actual: TState,
    context: TContext,
  ) {
    this.#actual = actual;
    this.#context = context;
  }

  static into<TContext extends TableContext>(
    client: Client,
    table: CreateTableContext<TContext>,
    // eslint-disable-next-line
  ): InsertBuilder<{}, TContext> {
    return new InsertBuilder(client, {}, table.context);
  }

  private clone<T extends Partial<InsertBuilderInput>>(actual: T) {
    return new InsertBuilder(this.client, actual, this.#context);
  }

  insert<V extends InsertValues<TContext>>(
    this: InsertBuilder<TState & { values?: never }, TContext>,
    values: V,
  ): InsertBuilder<TState & { values: V }, TContext> {
    return this.clone({
      ...this.#actual,
      values,
      // eslint-disable-next-line
    }) as any;
  }

  ifNotExists(
    this: InsertBuilder<TState & { ifNotExists?: never }, TContext>,
    option?: boolean,
  ) {
    return this.clone({
      ...this.#actual,
      ifNotExists: option ?? true,
    });
  }

  ttl(
    this: InsertBuilder<TState & { ttl?: never }, TContext>,
    seconds: number,
  ) {
    return this.clone({
      ...this.#actual,
      ttl: seconds,
    });
  }

  timestamp(
    this: InsertBuilder<TState & { timestamp?: never }, TContext>,
    microseconds: number,
  ) {
    return this.clone({
      ...this.#actual,
      timestamp: microseconds,
    });
  }

  private assembleValues(
    this: InsertBuilder<TState & { values: InsertValues<TContext> }, TContext>,
  ) {
    const columns = Object.keys(this.#actual.values);
    const columnList = columns.map((column) => `"${column}"`).join(", ");
    const valuePlaceholders = columns.map((key) => `:${key}`).join(", ");

    return `(${columnList}) VALUES (${valuePlaceholders})`;
  }

  private assembleOptions(
    this: InsertBuilder<TState & InsertBuilderInput, TContext>,
  ) {
    const options: string[] = [];

    if (this.#actual.ttl !== undefined) {
      options.push(`TTL ${this.#actual.ttl}`);
    }

    if (this.#actual.timestamp !== undefined) {
      options.push(`TIMESTAMP ${this.#actual.timestamp}`);
    }

    return options.length > 0 ? `USING ${options.join(" AND ")}` : "";
  }

  private buildCQL(
    this: InsertBuilder<
      TState & InsertBuilderInput,
      TContext & { table: string }
    >,
  ) {
    const parts = ["INSERT", "INTO"];

    if (this.#context.keyspace) {
      parts.push(`"${this.#context.keyspace}"."${this.#context.table}"`);
    } else {
      parts.push(`"${this.#context.table}"`);
    }

    const values = this.assembleValues();
    parts.push(values);

    if (this.#actual.ifNotExists) {
      parts.push("IF NOT EXISTS");
    }

    const options = this.assembleOptions();
    if (options) {
      parts.push(options);
    }

    return parts.join(" ") + ";";
  }

  build(
    this: InsertBuilder<
      TState & InsertBuilderInput,
      TContext & { table: string }
    >,
  ) {
    const cql = this.buildCQL();

    return InsertContext.create(this.client, cql, {
      insert: this.#actual,
      table: this.#context,
    });
  }

  toCQL(
    this: InsertBuilder<
      TState & InsertBuilderInput,
      TContext & { table: string }
    >,
  ) {
    return this.buildCQL();
  }
}
