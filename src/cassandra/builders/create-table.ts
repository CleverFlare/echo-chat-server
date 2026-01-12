import * as changeCase from "change-case";

import {
  ColumnDefinitions,
  InsertValues,
  SelectColumns,
  TableSchema,
  WithOption,
} from "../types";
import { Client } from "cassandra-driver";
import { InsertBuilder } from "./insert";
import { SelectBuilder } from "./select";

export class CreateTableStatement<Schema extends TableSchema = TableSchema> {
  constructor(
    private client: Client,
    public statement: string,
    private tableName: string,
    private schema: Schema,
    private keyspaceName?: string,
  ) {}

  insert(data: InsertValues<Schema["columns"], Schema>) {
    return new InsertBuilder(this.client, this.schema)
      .into(this.tableName, this.keyspaceName)
      .values(data);
  }

  select<T extends SelectColumns<Schema["columns"], Schema> | "*">(
    firstColumn?: T,
    ...columns: T extends "*" | undefined
      ? never[]
      : SelectColumns<Schema["columns"], Schema>[]
  ) {
    return new SelectBuilder(this.client, this.schema)
      .columns(firstColumn, ...columns)
      .from(this.tableName, this.keyspaceName);
  }

  async execute() {
    return this.client.execute(this.statement);
  }
}

export class CreateTableBuilder<
  T extends ColumnDefinitions = ColumnDefinitions,
  Schema extends TableSchema<T> = TableSchema<T>,
> {
  private tableName?: string;
  private keyspace?: string;
  private ifNotExistsClause = false;
  private columns?: string;
  private withClause?: string;
  private schema?: Schema;

  constructor(private client: Client) {}

  table(tableName: string, keyspace?: string) {
    this.tableName = tableName;
    this.keyspace = keyspace;

    return this;
  }

  ifNotExists() {
    this.ifNotExistsClause = true;

    return this;
  }

  definitions<
    const C extends ColumnDefinitions,
    const S extends TableSchema<C>,
  >(schema: TableSchema<C> | S): CreateTableBuilder<S["columns"], S> {
    const entries = Object.entries(schema.columns);

    let columns = entries
      .map(
        ([columnName, columnType]) =>
          `${changeCase.snakeCase(columnName)} ${columnType}`,
      )
      .join(", ");

    if ("primaryKey" in schema) {
      const primaryKey = schema.primaryKey!;

      const flattenedPrimaryKey = schema.primaryKey?.flat(1);

      const primaryKeySet = new Set(flattenedPrimaryKey);

      if (flattenedPrimaryKey?.length !== primaryKeySet.size)
        throw new Error("Primary key elements must be unique");

      let partitionKeys = [...primaryKey].shift();

      if (Array.isArray(partitionKeys)) {
        if (partitionKeys.length <= 1)
          throw new Error(
            "There must be at least two partition keys if you're using an array",
          );
        partitionKeys = "(" + partitionKeys.join(", ") + ")";
      }

      const clusteringKeys = primaryKey.join(", ");

      columns =
        columns +
        ", " +
        `PRIMARY KEY (${partitionKeys?.toString()}${clusteringKeys !== "" ? `, ${clusteringKeys}` : ""})`;
    }

    this.columns = `(${columns})`;

    // @ts-expect-error Accept schema
    this.schema = schema;

    return this as unknown as CreateTableBuilder<S["columns"], S>;
  }

  with(...options: [WithOption, ...WithOption[]]) {
    if (options.length <= 0)
      throw new Error("With clause must contain at least one option");

    const withOptions = [...options];

    this.withClause = ` WITH ${withOptions.join(" AND ")}`;

    return this;
  }

  // @ts-expect-error Accept the Schema
  build(): CreateTableStatement<Schema> {
    const parts: string[] = ["CREATE", "TABLE"];

    if (this.ifNotExistsClause) parts.push("IF NOT EXISTS");

    if (!this.tableName) throw new Error("Table name required");

    if (!this.keyspace) parts.push(this.tableName);
    else
      parts.push(
        `${changeCase.snakeCase(this.keyspace)}.${changeCase.snakeCase(this.tableName)}`,
      );

    if (!this.columns || !this.schema)
      throw new Error("Column definitions required");

    parts.push(this.columns);

    if (this.withClause) parts.push(this.withClause);

    // @ts-expect-error Accept the Schema
    return new CreateTableStatement<Schema>(
      this.client,
      parts.join(" ") + ";",
      this.tableName,
      this.schema,
      this.keyspace,
    );
  }
}
