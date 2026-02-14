import { WithOption } from "@/cql/with-options/types";
import { CreateTableBuilderInput } from "./types";
import { Schema, TableContext } from "../../types";
import { CreateTableContext } from "./context";
import { snakeCase } from "change-case";
import { SnakeCase, SnakeCasedProperties } from "type-fest";
import { Client } from "cassandra-driver";

export class CreateTableBuilder<TState extends CreateTableBuilderInput> {
  #actual: TState;

  private constructor(
    private client: Client,
    actual: TState,
  ) {
    this.#actual = actual;
  }

  static create(client: Client) {
    return new CreateTableBuilder(client, {});
  }

  private clone<T extends CreateTableBuilderInput>(
    actual: T,
  ): CreateTableBuilder<T> {
    return new CreateTableBuilder(this.client, actual);
  }

  keyspace(
    this: CreateTableBuilder<TState & { keyspace?: never }>,
    name: string,
  ) {
    return this.clone({
      ...this.#actual,
      keyspace: snakeCase(name) as SnakeCase<typeof name>,
    });
  }

  table(this: CreateTableBuilder<TState & { table?: never }>, name: string) {
    return this.clone({
      ...this.#actual,
      table: snakeCase(name) as SnakeCase<typeof name>,
    });
  }

  ifNotExists(
    this: CreateTableBuilder<TState & { ifNotExists?: never }>,
    option?: boolean,
  ) {
    return this.clone({
      ...this.#actual,
      ifNotExists: option ?? true,
    });
  }

  schema<const C extends Schema>(
    this: CreateTableBuilder<TState & { columns?: never }>,
    columns: C,
  ) {
    const schema = Object.entries(columns).reduce(
      (prev, [key, value]) => ({ ...prev, [snakeCase(key)]: value }),
      {},
    ) as SnakeCasedProperties<C>;
    return this.clone({ ...this.#actual, columns: schema });
  }

  // Overload 1: Single partition key
  primaryKey<
    const PK extends keyof TState["columns"],
    const CK extends readonly (keyof TState["columns"])[],
  >(
    this: CreateTableBuilder<
      { partitionKeys?: never; clusteringKeys?: never } & TState
    >,
    partitionKey: PK,
    ...clusteringKeys: CK
  ): CreateTableBuilder<
    TState & {
      partitionKeys: readonly [PK];
      clusteringKeys: CK;
    }
  >;

  // Overload 2: Array of partition keys
  primaryKey<
    const PK extends readonly (keyof TState["columns"])[],
    const CK extends readonly (keyof TState["columns"])[],
  >(
    this: CreateTableBuilder<{ primaryKey?: never } & TState>,
    partitionKey: PK,
    ...clusteringKeys: CK
  ): CreateTableBuilder<
    TState & {
      partitionKeys: PK;
      clusteringKeys: CK;
    }
  >;

  // Implementation signature
  // eslint-disable-next-line
  primaryKey(partitionKey: any, ...clusteringKeys: any[]): any {
    return this.clone({
      ...this.#actual,
      partitionKeys: Array.isArray(partitionKey)
        ? partitionKey
        : [partitionKey],
      clusteringKeys: clusteringKeys,
    });
  }

  clusteringOrderBy<PK extends readonly string[], CK extends readonly string[]>(
    this: CreateTableBuilder<
      TState & {
        partitionKeys: PK;
        clusteringKeys: CK;
        clusteringOrderBy?: never;
      }
    >,
    options: CK extends readonly []
      ? never
      : Partial<Record<CK[number], "asc" | "desc">>,
  ) {
    return this.clone({
      ...this.#actual,
      clusteringOrderBy: options,
    });
  }

  // eslint-disable-next-line
  with(...options: WithOption<any, any, any>[]) {
    return this.clone({
      ...this.#actual,
      withOptions: [...(this.#actual.withOptions ?? []), ...options],
    });
  }

  private assembleWithOptions(
    this: CreateTableBuilder<
      // eslint-disable-next-line
      TState & { withOptions: WithOption<any, any, any>[] }
    >,
  ) {
    const parts = [];

    const assembled =
      this.#actual.withOptions?.map((option) => option.cql) ?? [];

    if (this.#actual.clusteringOrderBy) {
      const clusteringOrder = Object.entries(this.#actual.clusteringOrderBy);
      parts.push(
        `CLUSTERING ORDER BY (${clusteringOrder.map(([key, value]) => `${key} ${value}`).join(", ")})`,
      );
    }

    parts.push(...assembled);

    return "WITH " + parts.join(" AND ");
  }

  private assembleSchema(this: CreateTableBuilder<TState & TableContext>) {
    const primaryKey = [
      this.#actual.partitionKeys,
      ...this.#actual.clusteringKeys,
    ];

    // Format the partition key to make it ready
    // to be joined along with the clustering keys
    primaryKey[0] =
      Array.isArray(primaryKey[0]) && primaryKey[0].length > 1
        ? `(${primaryKey[0].join(", ")})`
        : primaryKey[0].toString();

    const columns = Object.entries(this.#actual.columns).map(
      ([key, value]) => `${key} ${value.cql}`,
    );

    return `(${columns.join(", ")}, PRIMARY KEY ( ${primaryKey.join(", ")} ))`;
  }

  private buildCQL(this: CreateTableBuilder<TState & TableContext>) {
    const parts = ["CREATE", "TABLE"];

    if (this.#actual.keyspace && this.#actual.table)
      parts.push(`${this.#actual.keyspace}.${this.#actual.table}`);
    else if (this.#actual.table) parts.push(this.#actual.table);

    if (this.#actual.ifNotExists) parts.push("IF NOT EXISTS");

    const formattedSchema = this.assembleSchema();

    parts.push(formattedSchema);

    if (this.#actual.clusteringOrderBy || this.#actual.withOptions) {
      const formattedWithOptions = (
        this as CreateTableBuilder<
          TState & {
            // eslint-disable-next-line
            withOptions: WithOption<any, any, any>[];
          }
        >
      ).assembleWithOptions();

      parts.push(formattedWithOptions);
    }

    return parts.join(" ") + ";";
  }

  build<T extends TState & TableContext>(this: CreateTableBuilder<T>) {
    const cql = this.buildCQL();

    return CreateTableContext.create<T>(this.client, cql, this.#actual);
  }

  toCQL(this: CreateTableBuilder<TState & TableContext>): string {
    return this.buildCQL();
  }
}
