import { Schema } from "./types";
import { WithOption } from "@/cassandra-2/with-options/types";

export type CreateTableBuilderInput = {
  keyspace?: string;
  table: string;
  ifNotExists?: boolean;
  columns: Schema;
  primaryKey: [string | string[], ...string[]];
  clusteringOrderBy?: Record<string, "asc" | "desc">;
  // eslint-disable-next-line
  withOptions?: WithOption<any, any, any>[];
};

export type CreateTableBuilderGeneric = Partial<CreateTableBuilderInput>;

export class CreateTableBuilder<T extends CreateTableBuilderGeneric> {
  #actual: T;

  private constructor(actual: T) {
    this.#actual = actual;
  }

  static create() {
    return new CreateTableBuilder({});
  }

  keyspace(this: CreateTableBuilder<T & { keyspace?: never }>, name: string) {
    return new CreateTableBuilder({
      ...this.#actual,
      keyspace: name,
    });
  }

  table(this: CreateTableBuilder<T & { table?: never }>, name: string) {
    return new CreateTableBuilder({
      ...this.#actual,
      table: name,
    });
  }

  ifNotExists(
    this: CreateTableBuilder<T & { ifNotExists?: never }>,
    option?: boolean,
  ) {
    return new CreateTableBuilder({
      ...this.#actual,
      ifNotExists: option ?? true,
    });
  }

  columns<const C extends Schema>(
    this: CreateTableBuilder<T & { columns?: never }>,
    columns: C,
  ) {
    return new CreateTableBuilder({ ...this.#actual, columns });
  }

  primaryKey<
    const PK extends keyof T["columns"],
    const CK extends (keyof T["columns"])[],
  >(
    this: CreateTableBuilder<{ primaryKey?: never } & T>,
    partitionKey: PK | PK[],
    ...clusteringKeys: CK
  ) {
    return new CreateTableBuilder<
      Exclude<T, "primaryKey"> & {
        primaryKey: [PK | PK[], ...CK];
      }
    >({
      ...this.#actual,
      primaryKey: [partitionKey, ...clusteringKeys] as const,
    });
  }

  clusteringOrderBy<
    PK extends string | readonly string[],
    CK extends readonly string[],
  >(
    this: CreateTableBuilder<
      T & {
        primaryKey: [PK, ...CK];
        clusteringOrderBy?: never;
      }
    >,
    options: Partial<Record<CK[number], "asc" | "desc">>,
  ) {
    return new CreateTableBuilder({
      ...this.#actual,
      clusteringOrderBy: options,
    });
  }

  // eslint-disable-next-line
  with(...options: WithOption<any, any, any>[]) {
    return new CreateTableBuilder({
      ...this.#actual,
      withOptions: [...(this.#actual.withOptions ?? []), ...options],
    });
  }

  private assembleWithOptions(
    // eslint-disable-next-line
    this: CreateTableBuilder<T & { withOptions: WithOption<any, any, any>[] }>,
  ) {
    const parts = [];

    const assembled = this.#actual.withOptions.map((option) => option.cql);

    if (this.#actual.clusteringOrderBy) {
      const clusteringOrder = Object.entries(this.#actual.clusteringOrderBy);
      parts.push(
        `CLUSTERING ORDER BY (${clusteringOrder.map(([key, value]) => `${key} ${value}`).join(", ")})`,
      );
    }

    parts.push(...assembled);

    return "WITH " + parts.join(" AND ");
  }

  private assembleSchema(
    this: CreateTableBuilder<
      T & { columns: Schema; primaryKey: [string | string[], ...string[]] }
    >,
  ) {
    const primaryKey = [...this.#actual.primaryKey];

    // Format the partition key to make it ready
    // to be joined along with the clustering keys
    primaryKey[0] = Array.isArray(primaryKey[0])
      ? `(${primaryKey[0].join(", ")})`
      : primaryKey.toString();

    const columns = Object.entries(this.#actual.columns).map(
      ([key, value]) => `${key} ${value.cql}`,
    );

    return `(\n${columns.join(",\n")} PRIMARY KEY ( ${primaryKey.join(", ")} )\n)`;
  }

  build(
    this: CreateTableBuilder<
      T & {
        table: string;
        columns: Schema;
        primaryKey: [string | string[], ...string[]];
      }
    >,
  ) {
    const parts = ["CREATE", "TABLE"];

    if (!this.#actual.table) throw new Error("Table is required");

    if (this.#actual.keyspace)
      parts.push(`${this.#actual.keyspace}.${this.#actual.table}`);
    else parts.push(this.#actual.table);

    if (this.#actual.ifNotExists) parts.push("IF NOT EXISTS");

    if (!this.#actual.columns)
      throw new Error("Missing required columns schema");

    if (!this.#actual.primaryKey)
      throw new Error("Missing required primary key");

    const formattedSchema = this.assembleSchema();

    parts.push(formattedSchema);

    if (this.#actual.clusteringOrderBy || this.#actual.withOptions) {
      const formattedWithOptions = (
        this as CreateTableBuilder<
          T & {
            // eslint-disable-next-line
            withOptions: WithOption<any, any, any>[];
          }
        >
      ).assembleWithOptions();

      parts.push(formattedWithOptions);
    }

    const cql = parts.join(" ") + ";";

    return { cql, context: this.#actual };
  }
}
