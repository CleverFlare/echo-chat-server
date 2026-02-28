import { Client } from "cassandra-driver";
import { GetCqlTypeOperators, TableContext } from "@/cql/types";
import { CreateTableContext } from "../create-table/context";
import { BaseMeta, CqlKind, CqlType } from "@/cql/cql-types/types";
import { Deletion, DeleteBuilderInput, HasFullPrimaryKey } from "./types";
import { DeleteContext } from "./context";

// ---------------------------------------------------------------------------
// Column-kind helpers (mirrors the pattern used in the update builder)
// ---------------------------------------------------------------------------

type ColumnsOfKind<TContext extends TableContext, K extends CqlKind> = {
  [C in keyof TContext["columns"]]: TContext["columns"][C] extends CqlType<
    // eslint-disable-next-line
    any,
    K,
    // eslint-disable-next-line
    BaseMeta<any, K>
  >
    ? C
    : never;
}[keyof TContext["columns"]] &
  string;

type MapColumn<TContext extends TableContext> = ColumnsOfKind<TContext, "map">;
type UdtColumn<TContext extends TableContext> = ColumnsOfKind<TContext, "udt">;

// ---------------------------------------------------------------------------
// DeleteBuilder
// ---------------------------------------------------------------------------

export class DeleteBuilder<
  TState extends Partial<DeleteBuilderInput>,
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
  ): DeleteBuilder<{}, TContext> {
    return new DeleteBuilder(client, {}, table.context);
  }

  private clone<T extends Partial<DeleteBuilderInput>>(actual: T) {
    return new DeleteBuilder(this.client, actual, this.#context);
  }

  // -------------------------------------------------------------------------
  // Column-level deletion targets
  // -------------------------------------------------------------------------

  /**
   * Mark an entire column for deletion (`DELETE col FROM …`).
   * Omitting all `column()` / `field()` / `index()` calls produces a
   * full-row delete instead.
   */
  column<const C extends keyof TContext["columns"] & string>(
    column: C,
  ): DeleteBuilder<TState & { deletions: Deletion[] }, TContext> {
    return this.clone({
      ...this.#actual,
      deletions: [
        ...(this.#actual.deletions ?? []),
        { kind: "column", column },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  /**
   * Mark a UDT field for deletion (`DELETE col.field FROM …`).
   */
  field<
    const C extends UdtColumn<TContext>,
    const F extends keyof TContext["columns"][C]["_meta"]["ts"] & string,
  >(
    column: C,
    field: F,
  ): DeleteBuilder<TState & { deletions: Deletion[] }, TContext> {
    return this.clone({
      ...this.#actual,
      deletions: [
        ...(this.#actual.deletions ?? []),
        { kind: "field", column, field },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  /**
   * Mark a map entry for deletion by key (`DELETE col[key] FROM …`).
   */
  index<
    const C extends MapColumn<TContext>,
    const K extends TContext["columns"][C] extends CqlType<
      // eslint-disable-next-line
      any,
      "map",
      // eslint-disable-next-line
      infer M extends BaseMeta<any, "map">
    >
      ? M["ts"] extends Map<infer MK, unknown>
        ? MK
        : never
      : never,
  >(
    column: C,
    key: K,
  ): DeleteBuilder<TState & { deletions: Deletion[] }, TContext> {
    return this.clone({
      ...this.#actual,
      deletions: [
        ...(this.#actual.deletions ?? []),
        { kind: "index", column, key },
      ],
      // eslint-disable-next-line
    }) as any;
  }

  // -------------------------------------------------------------------------
  // WHERE clause (first condition)
  // -------------------------------------------------------------------------

  where<
    const WhereConditions extends undefined,
    const C extends
      | TContext["partitionKeys"][number]
      | TContext["clusteringKeys"][number],
    O extends GetCqlTypeOperators<C, TContext>,
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: DeleteBuilder<
      Omit<TState, "whereConditions"> & {
        whereConditions?: WhereConditions;
      },
      TContext
    >,
    column: C,
    operator: O,
    value: V,
  ): DeleteBuilder<TState & { whereConditions: [[C, O, V]] }, TContext>;

  // WHERE clause (subsequent conditions)
  where<
    const WhereConditions extends readonly [string, string, unknown][],
    const C extends
      | TContext["partitionKeys"][number]
      | TContext["clusteringKeys"][number],
    O extends GetCqlTypeOperators<C, TContext>,
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: DeleteBuilder<
      Omit<TState, "whereConditions"> & {
        whereConditions: WhereConditions;
      },
      TContext
    >,
    column: C,
    operator: O,
    value: V,
  ): DeleteBuilder<
    TState & { whereConditions: [...WhereConditions, [C, O, V]] },
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

  // -------------------------------------------------------------------------
  // IF conditions
  // -------------------------------------------------------------------------

  /**
   * Add a lightweight-transaction condition on a regular (non-primary-key)
   * column. Mutually exclusive with `ifExists()`.
   */
  if<
    const C extends Exclude<
      keyof TContext["columns"],
      TContext["partitionKeys"][number] | TContext["clusteringKeys"][number]
    > &
      string,
    O extends NonNullable<
      TContext["columns"][C]["_meta"]["operators"]
    >["regular"][number],
    V extends TContext["columns"][C]["_meta"]["ts"],
  >(
    this: DeleteBuilder<
      TState & {
        whereConditions: readonly [string, string, unknown][];
        ifExists?: never;
      },
      TContext
    >,
    column: C,
    operator: O,
    value: V,
  ): DeleteBuilder<
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

  /**
   * Only delete the row if it exists (lightweight transaction).
   * Mutually exclusive with `if()`.
   */
  ifExists(
    this: DeleteBuilder<
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

  /**
   * Set the write timestamp (microseconds since epoch) used to determine
   * which delete wins during conflict resolution.
   */
  timestamp(
    this: DeleteBuilder<TState & { timestamp?: never }, TContext>,
    microseconds: number,
  ) {
    return this.clone({ ...this.#actual, timestamp: microseconds });
  }

  // -------------------------------------------------------------------------
  // CQL assembly (private)
  // -------------------------------------------------------------------------

  private assembleTargets() {
    const deletions = this.#actual.deletions;
    if (!deletions?.length) return "";

    return (
      " " +
      deletions
        .map((d) => {
          switch (d.kind) {
            case "column":
              return d.column;
            case "field":
              return `${d.column}.${d.field}`;
            case "index":
              return `${d.column}[?]`;
          }
        })
        .join(", ")
    );
  }

  private assembleConditions(conditions: readonly [string, string, unknown][]) {
    return conditions.map(([col, op]) => `${col} ${op} ?`).join(" AND ");
  }

  private buildCQL(
    this: DeleteBuilder<
      TState & DeleteBuilderInput,
      TContext & { table: string }
    >,
  ) {
    const parts = ["DELETE"];

    // Optional column targets (absent = full-row delete)
    parts[0] += this.assembleTargets();

    parts.push("FROM");

    if (this.#context.keyspace) {
      parts.push(`${this.#context.keyspace}.${this.#context.table}`);
    } else {
      parts.push(this.#context.table);
    }

    if (this.#actual.timestamp !== undefined) {
      parts.push(`USING TIMESTAMP ${this.#actual.timestamp}`);
    }

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

  // -------------------------------------------------------------------------
  // Public terminal methods
  // -------------------------------------------------------------------------

  build(
    this: HasFullPrimaryKey<TState["whereConditions"], TContext> extends true
      ? DeleteBuilder<TState & DeleteBuilderInput, TContext & { table: string }>
      : never,
  ) {
    const cql = this.buildCQL();

    // index deletions carry a key value that becomes a positional parameter
    const indexValues = (this.#actual.deletions ?? [])
      .filter((d): d is typeof d & { kind: "index" } => d.kind === "index")
      .map((d) => d.key);

    const values = [
      ...indexValues,
      ...this.#actual.whereConditions.map(([, , v]) => v),
      ...(this.#actual.ifConditions?.map(([, , v]) => v) ?? []),
    ];

    return DeleteContext.create(this.client, cql, values, {
      delete: this.#actual,
      table: this.#context,
    });
  }

  toCQL(
    this: DeleteBuilder<
      TState & DeleteBuilderInput,
      TContext & { table: string }
    >,
  ) {
    return this.buildCQL();
  }
}
