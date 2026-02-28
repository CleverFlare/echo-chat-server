import { Client } from "cassandra-driver";
import { GetCqlTypeOperators, TableContext } from "@/cql/types";
import { CreateTableContext } from "../create-table/context";
import {
  HasFullPrimaryKey,
  ListColumn,
  MapColumn,
  SetColumn,
  UdtColumn,
  Update,
  UpdateBuilderInput,
} from "./types";
import { UpdateContext } from "./context";

export class UpdateBuilder<
  TState extends Partial<UpdateBuilderInput>,
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
  ): UpdateBuilder<{}, TContext> {
    return new UpdateBuilder(client, {}, table.context);
  }

  private clone<T extends Partial<UpdateBuilderInput>>(actual: T) {
    return new UpdateBuilder(this.client, actual, this.#context);
  }

  set<
    const Column extends keyof TContext["columns"],
    const Value extends TContext["columns"][Column]["_meta"]["ts"],
  >(
    this: UpdateBuilder<TState, TContext>,
    column: Column,
    value: Value,
  ): UpdateBuilder<TState & { updates: Update[] }, TContext> {
    return this.clone({
      ...this.#actual,
      updates: [
        ...(this.#actual.updates || []),
        { kind: "replace", column, value },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  append<
    const Column extends
      | MapColumn<TContext>
      | ListColumn<TContext>
      | SetColumn<TContext>,
    const Value extends TContext["columns"][Column]["_meta"]["ts"],
  >(
    this: UpdateBuilder<TState, TContext>,
    column: Column,
    value: Value,
  ): UpdateBuilder<TState & { updates: Update[] }, TContext> {
    return this.clone({
      ...this.#actual,
      updates: [
        ...(this.#actual.updates || []),
        { kind: "append", column, value },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  prepend<
    const Column extends ListColumn<TContext>,
    const Value extends TContext["columns"][Column]["_meta"]["ts"],
  >(
    this: UpdateBuilder<TState, TContext>,
    column: Column,
    value: Value,
  ): UpdateBuilder<TState & { updates: Update[] }, TContext> {
    return this.clone({
      ...this.#actual,
      updates: [
        ...(this.#actual.updates || []),
        { kind: "prepend", column, value },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  remove<
    const Column extends
      | ListColumn<TContext>
      | MapColumn<TContext>
      | SetColumn<TContext>,
    const Value extends TContext["columns"][Column]["_meta"]["ts"],
  >(
    this: UpdateBuilder<TState, TContext>,
    column: Column,
    value: Value,
  ): UpdateBuilder<TState & { updates: Update[] }, TContext> {
    return this.clone({
      ...this.#actual,
      updates: [
        ...(this.#actual.updates || []),
        { kind: "remove", column, value },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  setField<
    const Column extends UdtColumn<TContext>,
    const Field extends keyof TContext["columns"][Column]["_meta"]["ts"],
    const Value extends TContext["columns"][Column]["_meta"]["ts"][Field],
  >(
    this: UpdateBuilder<TState, TContext>,
    column: Column,
    field: Field,
    value: Value,
  ): UpdateBuilder<TState & { updates: Update[] }, TContext> {
    return this.clone({
      ...this.#actual,
      updates: [
        ...(this.#actual.updates || []),
        { kind: "setField", column, field, value },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  setIndex<
    const Column extends UdtColumn<TContext>,
    const Field extends keyof TContext["columns"][Column]["_meta"]["ts"],
    const Value extends TContext["columns"][Column]["_meta"]["ts"][Field],
  >(
    this: UpdateBuilder<TState, TContext>,
    column: Column,
    field: Field,
    value: Value,
  ): UpdateBuilder<TState & { updates: Update[] }, TContext> {
    return this.clone({
      ...this.#actual,
      updates: [
        ...(this.#actual.updates || []),
        { kind: "setField", column, field, value },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  where<
    const WhereConditions extends undefined,
    const C extends
      | TContext["partitionKeys"][number]
      | TContext["clusteringKeys"][number],
    O extends GetCqlTypeOperators<C, TContext>,
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: UpdateBuilder<
      Omit<TState, "updates" | "whereConditions"> & {
        updates: Update[];
        whereConditions?: WhereConditions;
      },
      TContext
    >,
    column: C,
    operator: O,
    value: V,
  ): UpdateBuilder<TState & { whereConditions: [[C, O, V]] }, TContext>;

  where<
    const WhereConditions extends readonly [string, string, unknown][],
    const C extends
      | TContext["partitionKeys"][number]
      | TContext["clusteringKeys"][number],
    O extends GetCqlTypeOperators<C, TContext>,
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: UpdateBuilder<
      Omit<TState, "updates"> & {
        updates: Update[];
        whereConditions: WhereConditions;
      },
      TContext
    >,
    column: C,
    operator: O,
    value: V,
  ): UpdateBuilder<
    TState & {
      whereConditions: [...WhereConditions, [C, O, V]];
    },
    TContext
  >;

  where(
    // eslint-disable-next-line
    column: any,
    // eslint-disable-next-line
    operator: any,
    // eslint-disable-next-line
    value: any,
  ) {
    return this.clone({
      ...this.#actual,
      whereConditions: [
        ...(this.#actual.whereConditions ?? []),
        [column, operator, value] as const,
      ] as const,
      // eslint-disable-next-line
    }) as any;
  }

  if<
    const C extends keyof TContext["columns"] & string,
    O extends GetCqlTypeOperators<C, TContext>,
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: UpdateBuilder<
      TState & {
        whereConditions: readonly [string, string, unknown][];
        ifExists?: never;
      },
      TContext
    >,
    column: C,
    operator: O,
    value: V,
  ): UpdateBuilder<
    TState & { ifConditions: readonly [string, string, unknown][] },
    TContext
  > {
    return this.clone({
      ...this.#actual,
      ifConditions: [
        ...(this.#actual.ifConditions ?? []),
        [column, operator, value] as const,
      ] as const,
      // eslint-disable-next-line
    }) as any;
  }

  ifExists(
    this: UpdateBuilder<
      TState & {
        whereConditions: readonly [string, string, unknown][];
        ifExists?: never;
        ifConditions?: never;
      },
      TContext
    >,
    option?: boolean,
  ) {
    return this.clone({ ...this.#actual, ifExists: option ?? true });
  }

  ttl(
    this: UpdateBuilder<TState & { ttl?: never }, TContext>,
    seconds: number,
  ) {
    return this.clone({ ...this.#actual, ttl: seconds });
  }

  timestamp(
    this: UpdateBuilder<TState & { timestamp?: never }, TContext>,
    microseconds: number,
  ) {
    return this.clone({ ...this.#actual, timestamp: microseconds });
  }

  private assembleUpdates(
    this: UpdateBuilder<TState & { updates: readonly Update[] }, TContext>,
  ) {
    const formattedUpdates: string[] = this.#actual.updates.map((update) => {
      switch (update.kind) {
        case "replace":
          return `${update.column} = ?`;
        case "append":
          return `${update.column} = ${update.column} + ?`;
        case "prepend":
          return `${update.column} = ? + ${update.column}`;
        case "remove":
          return `${update.column} = ${update.column} - ?`;
        case "setField":
          return `${update.column}.${update.field} = ?`;
        case "setIndex":
          return `${update.column}[${update.key}] = ?`;
        default:
          return "";
      }
    });

    return formattedUpdates.join(", ");
  }

  private assembleConditions(conditions: readonly [string, string, unknown][]) {
    return conditions.map(([col, op]) => `${col} ${op} ?`).join(" AND ");
  }

  private assembleOptions(
    this: UpdateBuilder<TState & UpdateBuilderInput, TContext>,
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
    this: UpdateBuilder<
      TState & UpdateBuilderInput,
      TContext & { table: string }
    >,
  ) {
    const parts = ["UPDATE"];

    if (this.#context.keyspace) {
      parts.push(`${this.#context.keyspace}.${this.#context.table}`);
    } else {
      parts.push(this.#context.table);
    }

    const options = this.assembleOptions();
    if (options) {
      parts.push(options);
    }

    parts.push("SET");
    parts.push(this.assembleUpdates());

    parts.push("WHERE");
    parts.push(this.assembleConditions(this.#actual.whereConditions));

    if (this.#actual.ifExists) {
      parts.push("IF EXISTS");
    } else if (this.#actual.ifConditions?.length) {
      parts.push("IF");
      parts.push(this.assembleConditions(this.#actual.ifConditions));
    }

    return parts.join(" ") + ";";
  }

  build(
    this: HasFullPrimaryKey<TState["whereConditions"], TContext> extends true
      ? UpdateBuilder<TState & UpdateBuilderInput, TContext & { table: string }>
      : never,
  ) {
    const cql = this.buildCQL();

    const values = [
      ...this.#actual.updates.map((update) => update.value),
      ...this.#actual.whereConditions.map(([, , v]) => v),
      ...(this.#actual.ifConditions?.map(([, , v]) => v) ?? []),
    ];

    return UpdateContext.create(this.client, cql, values, {
      update: this.#actual,
      table: this.#context,
    });
  }

  toCQL(
    this: UpdateBuilder<
      TState & UpdateBuilderInput,
      TContext & { table: string }
    >,
  ) {
    return this.buildCQL();
  }
}
