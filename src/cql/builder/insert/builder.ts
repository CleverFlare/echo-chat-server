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

  static into<TInitialContext extends CreateTableContext<TableContext>>(
    client: Client,
    table: TInitialContext,
    // eslint-disable-next-line
  ): InsertBuilder<{}, TInitialContext["context"]> {
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
    const columnList = columns.join(", ");
    const valuePlaceholders = columns.map(() => "?").join(", ");

    return {
      columns: columnList,
      placeholders: valuePlaceholders,
      values: Object.values(this.#actual.values),
    };
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
      parts.push(`${this.#context.keyspace}.${this.#context.table}`);
    } else {
      parts.push(this.#context.table);
    }

    const { columns, placeholders } = this.assembleValues();
    parts.push(`(${columns})`);
    parts.push("VALUES");
    parts.push(`(${placeholders})`);

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
    const { values } = this.assembleValues();

    return InsertContext.create(this.client, cql, values, {
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
