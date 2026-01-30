import { cql } from "@/cassandra-2/cql-types";
import { ColumnsSchema } from "./types";

type CreateTableBuilderInput = {
  keyspace: string;
  table: string;
  ifNotExists: boolean;
  columns: ColumnsSchema;
  primaryKey: [string | string[], ...string[]];
  clusteringOrderBy: Record<string, "asc" | "desc">;
};

type CreateTableBuilderGeneric = Partial<CreateTableBuilderInput>;

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
      hasKeyspace: true,
    });
  }

  table(this: CreateTableBuilder<T & { table?: never }>, name: string) {
    return new CreateTableBuilder({
      ...this.#actual,
      table: name,
      hasTable: true,
    });
  }

  ifNotExists(
    this: CreateTableBuilder<T & { ifNotExists?: never }>,
    option?: boolean,
  ) {
    return new CreateTableBuilder({
      ...this.#actual,
      ifNotExists: option ?? true,
      hasIfNotExists: true,
    });
  }

  columns<const C extends ColumnsSchema>(
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

  with() {}

  build() {}
}

// eslint-disable-next-line
const example = CreateTableBuilder.create()
  .table("table")
  .ifNotExists()
  .columns({
    id: cql.scalar.uuid,
    firstName: cql.scalar.text,
    lastName: cql.scalar.text,
    email: cql.scalar.text,
  })
  .primaryKey(["id", "email"], "firstName")
  .clusteringOrderBy({ firstName: "asc" });
