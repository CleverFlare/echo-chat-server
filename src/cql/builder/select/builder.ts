import { GetCqlTypeOperators, TableContext } from "@/cql/types";
import { CreateTableContext } from "../create-table/context";
import { Client } from "cassandra-driver";
import {
  AppendWhereCondition,
  SelectableColumn,
  SelectInput,
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

  static from<TInitialContext extends CreateTableContext<TableContext>>(
    client: Client,
    table: TInitialContext,
    // eslint-disable-next-line
  ): SelectBuilder<{}, TInitialContext["context"]> {
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
        columns: Object.keys(this.#context.columns),
        // eslint-disable-next-line
      }) as any;
    }

    return this.clone({
      ...this.#actual,
      columns: [first, ...rest],
      // eslint-disable-next-line
    }) as any;
  }

  testSelect(
    this: SelectBuilder<TState & { columns: SelectInput["columns"] }, TContext>,
    columns: TState["columns"],
  ) {}

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
    if (this.#actual.columns[0] === "*") {
      return "*";
    }

    return this.#actual.columns.join(", ");
  }

  private buildCQL(
    this: SelectBuilder<TState & SelectInput, TContext & { table: string }>,
  ) {
    const parts = ["SELECT"];

    parts.push(this.assembleColumns());

    parts.push("FROM");

    parts.push(this.#context.table);

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
