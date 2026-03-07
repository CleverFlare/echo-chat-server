import { GetCqlTypeOperators, TableContext } from "@/cql/types";
import { CreateTableContext } from "../create-table/context";
import { Client } from "cassandra-driver";
import {
  SelectInput,
  AppendWhereCondition,
  SelectableColumn,
  ValidatePartitionKeys,
} from "./types";
import { SelectContext } from "./context";
import { UnionToTuple } from "type-fest";

export class SelectBuilder<
  TState extends Partial<SelectInput>,
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

  static from<TContext extends TableContext>(
    client: Client,
    table: CreateTableContext<TContext>,
    // eslint-disable-next-line
  ): SelectBuilder<{}, TContext> {
    return new SelectBuilder(client, {}, table.context);
  }

  private clone<T extends Partial<SelectInput>>(actual: T) {
    return new SelectBuilder(this.client, actual, this.#context);
  }

  select<
    Rest extends First extends "*" | undefined
      ? never[]
      : SelectableColumn<TContext>[],
    First extends SelectableColumn<TContext> | "*" | undefined = undefined,
  >(
    first?: First,
    ...rest: Rest
  ): SelectBuilder<
    TState & {
      columns: First extends "*" | undefined
        ? UnionToTuple<keyof TContext["columns"]>
        : [First, ...Rest];
    },
    TContext
  > {
    if (first === undefined || first === "*") {
      return this.clone({
        ...this.#actual,
        columns: "*",
        // eslint-disable-next-line
      }) as any;
    }

    return this.clone({
      ...this.#actual,
      columns: [first, ...rest],
      // eslint-disable-next-line
    }) as any;
  }

  where<
    const C extends
      | TContext["partitionKeys"][number]
      | TContext["clusteringKeys"][number],
    O extends GetCqlTypeOperators<C, TContext>,
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: SelectBuilder<TState & { columns: SelectInput["columns"] }, TContext>,
    column: C,
    operator: O,
    value: V,
  ): SelectBuilder<AppendWhereCondition<TState, C, O, V>, TContext> {
    return this.clone({
      ...this.#actual,
      whereConditions: [
        ...(this.#actual.whereConditions ?? []),
        [column, operator, value] as const,
      ] as const,
      // eslint-disable-next-line
    }) as any;
  }

  private assembleColumns(
    this: SelectBuilder<TState & { columns: SelectInput["columns"] }, TContext>,
  ) {
    if ((this.#actual.columns as readonly string[] | "*") === "*") {
      return "*";
    }

    return this.#actual.columns.map((column) => `"${column}"`).join(", ");
  }

  private buildCQL(
    this: SelectBuilder<TState & SelectInput, TContext & { table: string }>,
  ) {
    const parts = ["SELECT"];

    parts.push(this.assembleColumns());

    parts.push("FROM");

    const table = this.#context.keyspace
      ? `"${this.#context.keyspace}"."${this.#context.table}"`
      : `"${this.#context.table}"`;

    parts.push(table);

    return parts.join(" ") + ";";
  }

  build(this: ValidatePartitionKeys<TState, TContext>) {
    const cql = this.buildCQL();

    return SelectContext.create(this.client, cql, {
      select: this.#actual,
      table: this.#context,
    });
  }

  toCQL(
    this: SelectBuilder<TState & SelectInput, TContext & { table: string }>,
  ) {
    return this.buildCQL();
  }
}
